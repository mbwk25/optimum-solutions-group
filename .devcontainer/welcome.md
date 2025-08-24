# 🚀 Welcome to Optimum Solutions Group Development Environment

You're now running in a fully configured development container with all the tools you need!

## 🛠️ What's Included

### Development Tools
- ✅ **Node.js 20** - Latest LTS version
- ✅ **npm & yarn** - Package managers
- ✅ **TypeScript** - Type-safe JavaScript
- ✅ **ESLint & Prettier** - Code quality tools
- ✅ **GitHub CLI** - Manage repos from terminal
- ✅ **Docker** - Container support
- ✅ **Zsh + Oh My Zsh** - Enhanced shell

### VS Code Extensions
- 🎨 **Tailwind CSS IntelliSense**
- 🔍 **ESLint & Prettier**
- 🧪 **Test Explorer**
- 🐙 **GitHub Copilot**
- 🔗 **GitLens**
- 📝 **Auto Rename Tag**
- 🌟 **Path IntelliSense**
- 🚨 **Error Lens**

## 🚀 Quick Start

```bash
# Start development server
npm run dev

# Run tests
npm test

# Build project
npm run build

# Run performance monitoring locally
npm run test:workflow:local

# Check performance budgets
npm run budgets:check

# Generate status badges
npm run badges:generate
```

## 📊 Available Services

The following ports are automatically forwarded:

- **Port 3000** 🔗 Development Server (Vite)
- **Port 4173** 🔗 Preview Server  
- **Port 8080** 🔗 Test Server (Cypress)

## 🎯 Project Features

This development environment includes:

### 🔍 Performance Monitoring
- Automated Lighthouse audits
- Core Web Vitals tracking
- Bundle size analysis
- Performance budgets enforcement

### 🛡️ Security & Quality
- CodeQL security analysis
- Dependency vulnerability scanning
- Automated testing (Jest + Cypress)
- Accessibility testing

### 📈 CI/CD Pipeline
- GitHub Actions workflows
- Automated deployment
- Performance dashboard
- PR quality gates

## 💡 Pro Tips

1. **Use GitHub Copilot** - AI-powered code suggestions
2. **Format on Save** - Code is auto-formatted with Prettier
3. **ESLint Integration** - Issues are highlighted in real-time
4. **Test Explorer** - Run and debug tests from the sidebar
5. **Performance Budgets** - Check `performance-budgets.json` for thresholds

## 📚 Useful Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run preview               # Preview production build

# Testing
npm run test                   # Unit tests
npm run test:watch            # Watch mode
npm run test:coverage         # Coverage report
npm run cypress:open          # E2E tests (interactive)
npm run cypress:run           # E2E tests (headless)

# Quality & Performance
npm run lint                   # Check code quality
npm run lint:fix              # Fix linting issues
npm run type-check            # TypeScript check
npm run analyze:bundle        # Bundle analysis
npm run budgets:check         # Performance budgets

# Workflows
npm run test:workflow:local   # Test GitHub Actions locally
npm run deploy:workflow       # Deployment instructions
npm run badges:generate       # Update status badges
```

## 🔗 Resources

- 📖 [Project README](../README.md)
- 🎯 [Performance Dashboard](https://mbwk25.github.io/optimum-solutions-group)
- 🛡️ [Security Guidelines](../SECURITY.md)
- 💡 [Contributing Guide](../CONTRIBUTING.md)

---

**Happy coding! 🎉**

Need help? Check the documentation or open an issue on GitHub.
