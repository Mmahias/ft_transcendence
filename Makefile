# Variables
DC = docker-compose

# Default rule
all: up

# Start the application
up:
	$(DC) up --build -d

# Stop and remove all containers
down:
	$(DC) down

# Clean the application
fclean: down
	$(DC) rm -v
	$(DC) down --volumes

# Re-build and start the application
re: fclean up

# Display logs for running containers in "follow" mode
tail:
	$(DC) logs -f

# Display logs for all containers
logs:
	$(DC) logs

reset: fclean 
reset: ./reset.sh
reset: all

.PHONY: all up logs down fclean re tail
