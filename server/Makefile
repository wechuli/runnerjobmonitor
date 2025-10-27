.PHONY: help install dev build test clean docker-build docker-run

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'

install: ## Install dependencies
	npm install

dev: ## Start development server
	npm run dev

build: ## Build for production
	npm run build

test: ## Run tests
	npm test

test-watch: ## Run tests in watch mode
	npm run test:watch

test-coverage: ## Run tests with coverage
	npm run test:coverage

clean: ## Clean build artifacts
	npm run clean

docker-build: ## Build Docker image
	docker build -t actionslogshipper .

docker-run: ## Run Docker container
	docker run -p 3000:3000 --env-file .env actionslogshipper

docker-clean: ## Remove Docker image
	docker rmi actionslogshipper

typecheck: ## Type check TypeScript
	npm run typecheck

setup: install ## Setup project (install + env)
	@if [ ! -f .env ]; then cp .env.example .env; echo "Created .env file"; fi
	@echo "Setup complete!"
