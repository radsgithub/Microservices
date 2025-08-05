#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration file
CONFIG_FILE="services.config"

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

# Function to load configuration
load_config() {
    if [ ! -f "$CONFIG_FILE" ]; then
        print_error "Configuration file $CONFIG_FILE not found!"
        exit 1
    fi
    
    # Source the configuration file
    source "$CONFIG_FILE"
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

# Function to wait for selected services to be ready
wait_for_selected_services() {
    print_status "Waiting for selected services to be ready..."
    
    local services_to_wait=()
    
    # Build list of services to wait for based on config
    if [ "$AUTH_SERVICE" = "true" ]; then
        services_to_wait+=("auth-service:$AUTH_SERVICE_PORT")
    fi
    if [ "$USER_SERVICE" = "true" ]; then
        services_to_wait+=("user-service:$USER_SERVICE_PORT")
    fi
    if [ "$PRODUCT_SERVICE" = "true" ]; then
        services_to_wait+=("product-service:$PRODUCT_SERVICE_PORT")
    fi
    if [ "$ORDER_SERVICE" = "true" ]; then
        services_to_wait+=("order-service:$ORDER_SERVICE_PORT")
    fi
    if [ "$API_GATEWAY" = "true" ]; then
        services_to_wait+=("api-gateway:$API_GATEWAY_PORT")
    fi
    
    if [ ${#services_to_wait[@]} -eq 0 ]; then
        print_warning "No services selected to start"
        return 0
    fi
    
    local max_attempts=60
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        local all_ready=true
        
        for service in "${services_to_wait[@]}"; do
            local name=$(echo $service | cut -d: -f1)
            local port=$(echo $service | cut -d: -f2)
            
            if ! check_port $port; then
                all_ready=false
                break
            fi
        done
        
        if $all_ready; then
            print_success "All selected services are ready!"
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
    
    # Check all services regardless of config
    local all_services=(
        "auth-service:$AUTH_SERVICE_PORT"
        "user-service:$USER_SERVICE_PORT"
        "product-service:$PRODUCT_SERVICE_PORT"
        "order-service:$ORDER_SERVICE_PORT"
        "api-gateway:$API_GATEWAY_PORT"
    )
    
    for service in "${all_services[@]}"; do
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

# Function to stop selected services
stop_selected_services() {
    print_status "Stopping selected services..."
    
    # Kill processes by PID files for selected services
    if [ -d "logs" ]; then
        for pid_file in logs/*.pid; do
            if [ -f "$pid_file" ]; then
                local service_name=$(basename "$pid_file" .pid)
                local pid=$(cat "$pid_file")
                
                # Check if this service was selected to start
                local should_stop=false
                case $service_name in
                    "auth-service") [ "$AUTH_SERVICE" = "true" ] && should_stop=true ;;
                    "user-service") [ "$USER_SERVICE" = "true" ] && should_stop=true ;;
                    "product-service") [ "$PRODUCT_SERVICE" = "true" ] && should_stop=true ;;
                    "order-service") [ "$ORDER_SERVICE" = "true" ] && should_stop=true ;;
                    "api-gateway") [ "$API_GATEWAY" = "true" ] && should_stop=true ;;
                esac
                
                if [ "$should_stop" = "true" ] && kill -0 $pid 2>/dev/null; then
                    kill $pid
                    print_status "Killed $service_name (PID: $pid)"
                fi
                rm "$pid_file"
            fi
        done
    fi
    
    print_success "Selected services stopped"
}

# Function to show configuration
show_config() {
    print_status "Current Configuration:"
    echo "========================"
    
    echo "AUTH_SERVICE: $AUTH_SERVICE"
    echo "USER_SERVICE: $USER_SERVICE"
    echo "PRODUCT_SERVICE: $PRODUCT_SERVICE"
    echo "ORDER_SERVICE: $ORDER_SERVICE"
    echo "API_GATEWAY: $API_GATEWAY"
    echo "NOTIFICATION_SERVICE: $NOTIFICATION_SERVICE"
    echo ""
    print_status "Edit $CONFIG_FILE to change which services to start"
}

# Main execution
main() {
    # Load configuration
    load_config
    
    case "$1" in
        "start")
            print_status "🚀 Starting selected microservices..."
            
            # Build common library first (only if needed)
            if [ ! -f "libs/common/dist/index.js" ]; then
                print_status "Building common library..."
                cd libs/common
                npm run build
                cd ../..
            else
                print_status "Common library already built, skipping..."
            fi
            
            # Start selected services
            if [ "$AUTH_SERVICE" = "true" ]; then
                start_service_background "auth-service" "apps/auth-service" $AUTH_SERVICE_PORT
            fi
            
            if [ "$USER_SERVICE" = "true" ]; then
                start_service_background "user-service" "apps/user-service" $USER_SERVICE_PORT
            fi
            
            if [ "$PRODUCT_SERVICE" = "true" ]; then
                start_service_background "product-service" "apps/product-service" $PRODUCT_SERVICE_PORT
            fi
            
            if [ "$ORDER_SERVICE" = "true" ]; then
                start_service_background "order-service" "apps/order-service" $ORDER_SERVICE_PORT
            fi
            
            if [ "$API_GATEWAY" = "true" ]; then
                start_service_background "api-gateway" "apps/api.gateway" $API_GATEWAY_PORT
            fi
            
            # Wait for selected services to be ready
            if wait_for_selected_services; then
                print_success "Selected services started successfully!"
                echo ""
                show_status
                echo ""
                print_status "📚 API Documentation available at:"
                if [ "$API_GATEWAY" = "true" ]; then
                    echo "   → http://localhost:$API_GATEWAY_PORT/api-docs (API Gateway)"
                fi
                if [ "$AUTH_SERVICE" = "true" ]; then
                    echo "   → http://localhost:$AUTH_SERVICE_PORT/api-docs/auth-service (Auth Service)"
                fi
                if [ "$USER_SERVICE" = "true" ]; then
                    echo "   → http://localhost:$USER_SERVICE_PORT/api-docs/user-service (User Service)"
                fi
                if [ "$PRODUCT_SERVICE" = "true" ]; then
                    echo "   → http://localhost:$PRODUCT_SERVICE_PORT/api-docs/product-service (Product Service)"
                fi
                if [ "$ORDER_SERVICE" = "true" ]; then
                    echo "   → http://localhost:$ORDER_SERVICE_PORT/api-docs/order-service (Order Service)"
                fi
            else
                print_error "Some services failed to start. Check logs:"
                echo "   ./start-all.sh logs <service-name>"
            fi
            
            # Note about notification service
            if [ "$NOTIFICATION_SERVICE" = "true" ]; then
                print_warning "notification-service requires Kafka to be running"
                print_status "To start notification-service manually: cd apps/notification-service && npm start"
            fi
            ;;
        "stop")
            stop_selected_services
            ;;
        "status")
            show_status
            ;;
        "config")
            show_config
            ;;
        *)
            echo "Usage: $0 {start|stop|status|config}"
            echo ""
            echo "Commands:"
            echo "  start   - Start selected services (based on services.config)"
            echo "  stop    - Stop selected services"
            echo "  status  - Show status of all services"
            echo "  config  - Show current configuration"
            echo ""
            echo "Configuration:"
            echo "  Edit $CONFIG_FILE to select which services to start"
            echo "  Set service to 'true' to start it, 'false' to skip it"
            exit 1
            ;;
    esac
}

# Handle Ctrl+C
trap 'print_status "Received interrupt signal"; stop_selected_services; exit 0' INT

# Run main function
main "$@" 