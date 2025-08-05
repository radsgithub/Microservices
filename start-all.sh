#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    print_status "Waiting for $service_name to be ready on port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if check_port $port; then
            print_success "$service_name is ready on port $port"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start on port $port after $max_attempts attempts"
    return 1
}

# Function to start a service
start_service() {
    local service_name=$1
    local service_path=$2
    local port=$3
    local log_file="logs/${service_name}.log"
    
    # Create logs directory if it doesn't exist
    mkdir -p logs
    
    print_status "Starting $service_name..."
    
    # Check if service is already running
    if check_port $port; then
        print_warning "$service_name is already running on port $port"
        return 0
    fi
    
    # Start the service in background
    cd "$service_path"
    npm start > "../$log_file" 2>&1 &
    local pid=$!
    echo $pid > "../logs/${service_name}.pid"
    cd - > /dev/null
    
    # Wait for service to be ready
    if wait_for_service $service_name $port; then
        print_success "$service_name started successfully (PID: $pid)"
        return 0
    else
        print_error "$service_name failed to start"
        return 1
    fi
}

# Function to stop all services
stop_all_services() {
    print_status "Stopping all services..."
    
    # Kill all background processes
    jobs -p | xargs -r kill
    
    # Kill processes by PID files
    if [ -d "logs" ]; then
        for pid_file in logs/*.pid; do
            if [ -f "$pid_file" ]; then
                local pid=$(cat "$pid_file")
                if kill -0 $pid 2>/dev/null; then
                    kill $pid
                    print_status "Killed process $pid"
                fi
                rm "$pid_file"
            fi
        done
    fi
    
    print_success "All services stopped"
}

# Function to show service status
show_status() {
    print_status "Service Status:"
    echo "=================="
    
    local services=(
        "auth-service:3000"
        "user-service:3001"
        "product-service:3002"
        "order-service:3003"
        "api-gateway:8000"
    )
    
    for service in "${services[@]}"; do
        local name=$(echo $service | cut -d: -f1)
        local port=$(echo $service | cut -d: -f2)
        
        if check_port $port; then
            print_success "$name is running on port $port"
        else
            print_error "$name is not running on port $port"
        fi
    done
    
    # Check notification service (no port)
    if pgrep -f "notification-service" > /dev/null; then
        print_success "notification-service is running"
    else
        print_warning "notification-service is not running (requires Kafka)"
    fi
}

# Function to show logs
show_logs() {
    local service_name=$1
    local log_file="logs/${service_name}.log"
    
    if [ -f "$log_file" ]; then
        echo "=== $service_name logs ==="
        tail -f "$log_file"
    else
        print_error "No log file found for $service_name"
    fi
}

# Main execution
main() {
    case "$1" in
        "start")
            print_status "🚀 Starting all microservices..."
            
            # Build common library first
            print_status "Building common library..."
            cd libs/common
            npm run build
            cd ../..
            
            # Start services in order
            start_service "auth-service" "apps/auth-service" 3000
            start_service "user-service" "apps/user-service" 3001
            start_service "product-service" "apps/product-service" 3002
            start_service "order-service" "apps/order-service" 3003
            start_service "api-gateway" "apps/api.gateway" 8000
            
            # Note about notification service
            print_warning "notification-service requires Kafka to be running"
            print_status "To start notification-service manually: cd apps/notification-service && npm start"
            
            print_success "All services started!"
            echo ""
            show_status
            echo ""
            print_status "📚 API Documentation available at:"
            echo "   → http://localhost:8000/api-docs (API Gateway)"
            echo "   → http://localhost:3000/api-docs/auth-service (Auth Service)"
            echo "   → http://localhost:3001/api-docs/user-service (User Service)"
            echo "   → http://localhost:3002/api-docs/product-service (Product Service)"
            echo "   → http://localhost:3003/api-docs/order-service (Order Service)"
            ;;
        "stop")
            stop_all_services
            ;;
        "restart")
            stop_all_services
            sleep 2
            main start
            ;;
        "status")
            show_status
            ;;
        "logs")
            if [ -z "$2" ]; then
                print_error "Please specify a service name"
                echo "Usage: $0 logs <service-name>"
                echo "Available services: auth-service, user-service, product-service, order-service, api-gateway"
                exit 1
            fi
            show_logs "$2"
            ;;
        "build")
            print_status "🏗️  Building all services..."
            ./build-all.sh
            ;;
        *)
            echo "Usage: $0 {start|stop|restart|status|logs|build}"
            echo ""
            echo "Commands:"
            echo "  start   - Start all services"
            echo "  stop    - Stop all services"
            echo "  restart - Restart all services"
            echo "  status  - Show status of all services"
            echo "  logs    - Show logs for a specific service"
            echo "  build   - Build all services"
            echo ""
            echo "Examples:"
            echo "  $0 start"
            echo "  $0 logs auth-service"
            echo "  $0 status"
            exit 1
            ;;
    esac
}

# Handle Ctrl+C
trap 'print_status "Received interrupt signal"; stop_all_services; exit 0' INT

# Run main function
main "$@" 