# Guide: Project Setup & CI Foundation

This guide details **Task 1** of our Roadmap: establishing a robust Continuous Integration (CI) foundation.

## 1. Introduction
"Project Setup & CI Foundation" refers to the automated tools and processes we put in place *before* writing complex code. It involves configuring:
*   **Linters**: Tools that analyze code for stylistic errors and bugs (e.g., `ruff`, `eslint`).
*   **Formatters**: Tools that automatically format code to a standard style (e.g., `ruff format`, `prettier`).
*   **Testing Frameworks**: Libraries for writing and running tests (e.g., `pytest`, `jest`).
*   **Pre-commit Hooks**: Scripts that run these tools automatically before you commit code.
*   **CI Pipelines**: Automated workflows (GitHub Actions) that run these checks on every Pull Request.

## 2. Why do we need it?
In the early stages of a project, it's tempting to skip this and "just code". However, this leads to **Technical Debt**:
1.  **Inconsistent Style**: One developer uses single quotes, another uses double. One uses 2 spaces, another uses 4. The codebase becomes hard to read.
2.  **Hidden Bugs**: Simple errors (like unused imports or undefined variables) go unnoticed until runtime.
3.  **"It works on my machine"**: Without a standardized CI environment, code might work locally but fail in production.
4.  **Shift Left**: The philosophy of "Shifting Left" means catching errors as early as possible in the development cycle. Fixing a bug during development is cheap; fixing it in production is expensive.

## 3. Benefits
*   **Consistency**: The codebase looks like it was written by a single person.
*   **Reliability**: Automated tests ensure that new changes don't break existing features (Regression Testing).
*   **Speed**: Developers spend less time arguing about code style in code reviews and more time discussing logic.
*   **Confidence**: You can deploy to production knowing that your code has passed a rigorous set of automated checks.

## 4. Step-by-Step Implementation Guide

### 4.1 Backend (Python)
We will use **Ruff**, an extremely fast Python linter and formatter that replaces `flake8`, `black`, and `isort`.

**Steps:**
1.  **Install Dependencies**:
    ```bash
    pip install ruff pytest
    ```
2.  **Configure `pyproject.toml`**:
    Create a `pyproject.toml` file in the root (or backend folder) to define rules.
    ```toml
    [tool.ruff]
    line-length = 88
    select = ["E", "F", "I"] # Enable pycodestyle errors, pyflakes, and isort
    ```
3.  **Run Locally**:
    ```bash
    ruff check .  # Lint
    ruff format . # Format
    pytest        # Test
    ```

### 4.2 Frontend (TypeScript/Next.js)
We will use standard tools for the React ecosystem.

**Steps:**
1.  **Install Dependencies**:
    ```bash
    npm install --save-dev eslint prettier eslint-config-prettier jest @testing-library/react @testing-library/jest-dom
    ```
2.  **Configure**:
    *   `.eslintrc.json`: Rules for linting.
    *   `.prettierrc`: Rules for formatting.
3.  **Run Locally**:
    ```bash
    npm run lint
    npm run test
    ```

### 4.3 Pre-commit Hooks
We want to ensure no one *accidentally* commits bad code.

**Steps:**
1.  **Install**:
    ```bash
    pip install pre-commit
    ```
2.  **Configure `.pre-commit-config.yaml`**:
    ```yaml
    repos:
      - repo: https://github.com/astral-sh/ruff-pre-commit
        rev: v0.1.0
        hooks:
          - id: ruff
          - id: ruff-format
    ```
3.  **Install Hooks**:
    ```bash
    pre-commit install
    ```
    Now, every time you run `git commit`, these checks will run automatically.

### 4.4 GitHub Actions (CI)
Finally, we automate this on the server.

**Steps:**
1.  Create `.github/workflows/ci.yml`.
2.  Define a workflow that triggers on `push` to `main` and `pull_request`.
3.  Add jobs:
    *   **Backend**: Checkout code -> Install Python -> Install dependencies -> Run Ruff -> Run Pytest.
    *   **Frontend**: Checkout code -> Install Node -> Install dependencies -> Run Lint -> Run Test.

---
**Next Step**: Now that you understand the "Why" and "How", you can proceed to implement these configurations in the project!
