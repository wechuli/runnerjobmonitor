# Contributing Guide

Thank you for considering contributing to this project!

## Getting Started

1. **Fork the repository**
2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/actionslogshipper.git
   cd actionslogshipper
   ```

3. **Install dependencies**

   ```bash
   npm install
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env
   ```

## Development Workflow

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**

   - Write clean, readable code
   - Follow the existing code style
   - Add tests for new features

3. **Run tests**

   ```bash
   npm test
   ```

4. **Build the project**

   ```bash
   npm run build
   ```

5. **Commit your changes**
   ```bash
   git commit -m "feat: add new feature"
   ```

## Commit Message Format

Follow conventional commits:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `test:` - Test updates
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

## Pull Request Process

1. Update documentation if needed
2. Ensure all tests pass
3. Update the README.md if adding features
4. Create a Pull Request with a clear description

## Code Style

- Use TypeScript strict mode
- Follow the existing patterns in the codebase
- Add JSDoc comments for public APIs

## Testing

- Write unit tests for all new features
- Maintain or improve code coverage
- Use descriptive test names

## Questions?

Feel free to open an issue for discussion!
