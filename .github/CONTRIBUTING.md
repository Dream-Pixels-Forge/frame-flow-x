# Contributing to Frame Flow X

First off, thank you for considering contributing to Frame Flow X! It's people like you that make Frame Flow X such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a detailed description of the suggested enhancement**
* **Explain why this enhancement would be useful**
* **List some examples of how this enhancement would be used**

### Pull Requests

* Fill in the required template
* Follow the TypeScript style guide
* Include tests if applicable
* Update documentation as needed
* Make sure all tests pass

## Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/frame-flow-x.git`
3. Install pnpm: `npm install -g pnpm`
4. Install dependencies: `pnpm install`
5. Start development: `pnpm dev`

## Coding Guidelines

### TypeScript

* Use TypeScript for all new code
* Follow the existing code style
* Add type definitions for all functions
* Use meaningful variable names

### React

* Use functional components with hooks
* Follow React best practices
* Keep components small and focused
* Use HeroUI components when possible

### Testing

* Write unit tests for new features
* Maintain or improve code coverage
* Run tests before submitting PR: `pnpm test`

### Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

## Release Process

Releases use semantic versioning:
* **MAJOR** version for incompatible changes
* **MINOR** version for backwards-compatible features
* **PATCH** version for backwards-compatible bug fixes

## Questions?

Feel free to open an issue with the "question" label or start a discussion!
