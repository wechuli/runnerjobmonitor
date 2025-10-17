# Contributing to GitHub Actions Runner Observability Tool

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/runnerjobmonitor.git`
3. Create a feature branch: `git checkout -b feature/my-new-feature`
4. Make your changes
5. Test your changes
6. Commit with clear messages: `git commit -m "Add feature X"`
7. Push to your fork: `git push origin feature/my-new-feature`
8. Open a Pull Request

## Development Setup

### Prerequisites
- Node.js 18 or higher
- npm 9 or higher
- Git

### Installation

```bash
# Install dependencies for all packages
npm install

# Or install individually
cd backend && npm install
cd ../frontend && npm install
```

### Running the Application

```bash
# Run both frontend and backend concurrently
npm run dev

# Or run separately
npm run dev:backend  # Terminal 1
npm run dev:frontend # Terminal 2
```

## Project Structure

```
/
├── backend/          # Express.js backend
│   ├── src/
│   │   ├── api/      # Route handlers
│   │   ├── services/ # Business logic
│   │   └── types/    # TypeScript types
│   └── prisma/       # Database schema
├── frontend/         # React frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
└── docs/            # Documentation
```

## Coding Standards

### TypeScript
- Use TypeScript for all new code
- Enable strict mode
- Properly type all functions and variables
- Avoid using `any` type

### Backend
- Follow Express.js best practices
- Use async/await for asynchronous code
- Implement proper error handling
- Use Prisma for database operations

### Frontend
- Use functional components with hooks
- Follow React best practices
- Use Chakra UI components
- Keep components small and focused

### Code Style
- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Use meaningful variable names
- Write self-documenting code

## Testing

Before submitting a PR:

1. Test that the backend builds: `cd backend && npm run build`
2. Test that the frontend builds: `cd frontend && npm run build`
3. Test that the backend starts: `cd backend && npm run dev`
4. Test that the frontend starts: `cd frontend && npm run dev`
5. Test API endpoints manually or with tools like Postman
6. Test the UI flows in the browser

## Pull Request Guidelines

### PR Title
Use clear, descriptive titles:
- ✅ "Add job filtering by status"
- ✅ "Fix memory leak in metrics collection"
- ❌ "Fix bug"
- ❌ "Update"

### PR Description
Include:
- What changes were made
- Why the changes were needed
- How to test the changes
- Screenshots for UI changes
- Any breaking changes

### Code Review
- Respond to review comments promptly
- Make requested changes or discuss alternatives
- Keep PRs focused on a single feature/fix
- Rebase on main before merging

## Commit Messages

Use conventional commit format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(backend): add job filtering endpoint

Add new API endpoint to filter jobs by status and date range.
Includes pagination support.

Closes #123
```

## Documentation

- Update README.md for user-facing changes
- Update API documentation for endpoint changes
- Add JSDoc comments for complex functions
- Update architecture docs for structural changes

## Security

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Follow security best practices
- Report security issues privately

## Questions?

- Open an issue for bugs or feature requests
- Use discussions for questions
- Check existing issues before creating new ones

Thank you for contributing! 🎉
