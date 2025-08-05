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

# Function to start a service in background
start_service_background() {
    local service_name=$1
    local service_path=$2
    local port=$3
    local log_file="logs/${service_name}.log"
    
    # Create logs directory if it doesn't exist
    mkdir -p logs
    
    print_status "Starting $service_name in background..."
    
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
    
    print_status "$service_name started (PID: $pid)"
    return 0
}

# Function to wait for all services to be ready
wait_for_all_services() {
    print_status "Waiting for all services to be ready..."
    
    local services=(
        "auth-service:3000"
        "user-service:3001"
        "product-service:3002"
        "order-service:3003"
        "api-gateway:8000"
    )
    
    local max_attempts=60  # Increased timeout
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        local all_ready=true
        
        for service in "${services[@]}"; do
            local name=$(echo $service | cut -d: -f1)
            local port=$(echo $service | cut -d: -f2)
            
            if ! check_port $port; then
                all_ready=false
                break
            fi
        done
        
        if $all_ready; then
            print_success "All services are ready!"
            return 0
        fi
        
        echo -n "."
        sleep 1
        attempt=$((attempt + 1))
    done
    
    print_error "Some services failed to start within timeout"
    return 1
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

# Main execution
main() {
    case "$1" in
        "start")
            print_status "🚀 Starting all microservices (FAST MODE)..."
            
            # Build common library first (only if needed)
            if [ ! -f "libs/common/dist/index.js" ]; then
                print_status "Building common library..."
                cd libs/common
                npm run build
                cd ../..
            else
                print_status "Common library already built, skipping..."
            fi
            
            # Start all services in parallel
            start_service_background "auth-service" "apps/auth-service" 3000
            start_service_background "user-service" "apps/user-service" 3001
            start_service_background "product-service" "apps/product-service" 3002
            start_service_background "order-service" "apps/order-service" 3003
            start_service_background "api-gateway" "apps/api.gateway" 8000
            
            # Wait for all services to be ready
            if wait_for_all_services; then
                print_success "All services started successfully!"
                echo ""
                show_status
                echo ""
                print_status "📚 API Documentation available at:"
                echo "   → http://localhost:8000/api-docs (API Gateway)"
                echo "   → http://localhost:3000/api-docs/auth-service (Auth Service)"
                echo "   → http://localhost:3001/api-docs/user-service (User Service)"
                echo "   → http://localhost:3002/api-docs/product-service (Product Service)"
                echo "   → http://localhost:3003/api-docs/order-service (Order Service)"
            else
                print_error "Some services failed to start. Check logs:"
                echo "   ./start-all.sh logs <service-name>"
            fi
            
            # Note about notification service
            print_warning "notification-service requires Kafka to be running"
            print_status "To start notification-service manually: cd apps/notification-service && npm start"
            ;;
        "stop")
            stop_all_services
            ;;
        "status")
            show_status
            ;;
        *)
            echo "Usage: $0 {start|stop|status}"
            echo ""
            echo "Commands:"
            echo "  start   - Start all services (FAST MODE - parallel startup)"
            echo "  stop    - Stop all services"
            echo "  status  - Show status of all services"
            echo ""
            echo "This is the FAST version that starts services in parallel!"
            exit 1
            ;;
    esac
}

# Handle Ctrl+C
trap 'print_status "Received interrupt signal"; stop_all_services; exit 0' INT

# Run main function
main "$@" 