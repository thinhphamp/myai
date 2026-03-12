# Primary Workflow

**IMPORTANT:** Analyze the skills catalog and activate the skills that are needed for the task during the process.
**IMPORTANT:** Ensure token efficiency while maintaining high quality.

#### 1. Planning
- Before starting, run `/myai:plan [task]` to create an implementation plan in `./plans`
- Use multiple `researcher` agents in parallel to conduct research on different technical topics
- The `planner` agent creates the final implementation plan with tasks
- Activate relevant skills based on plan content (see `myai:cook` command for skill detection table)

#### 2. Code Implementation
- Execute plans via `/myai:cook`
- Write clean, readable, and maintainable code
- Follow established architectural patterns
- Implement features according to specifications
- Handle edge cases and error scenarios
- **DO NOT** create new enhanced files — update existing files directly
- **[IMPORTANT]** After creating or modifying a code file, run compile command/script to check for errors

#### 3. Testing
- Delegate to `tester` agent to run tests on the implemented code
  - Write comprehensive unit tests
  - Ensure high code coverage
  - Test error scenarios
  - Validate performance requirements
- Tests verify the FINAL code that will be reviewed and merged
- **DO NOT** ignore failing tests just to pass the build
- **IMPORTANT:** Never use fake data, mocks, or temporary solutions just to pass tests
- **IMPORTANT:** Always fix failing tests and re-run until all pass

#### 4. Code Quality
- After testing passes, delegate to `code-reviewer` agent to review clean, tested code
- Follow coding standards and conventions
- Write self-documenting code
- Add meaningful comments for complex logic
- Optimize for performance and maintainability

#### 5. Integration
- Always follow the plan from `/myai:plan`
- Ensure seamless integration with existing code
- Follow API contracts precisely
- Maintain backward compatibility
- Document breaking changes
- Delegate to `docs-manager` agent to update `./docs` directory if needed

#### 6. Debugging
- When bugs or issues are reported, delegate to `debugger` agent to run tests and analyze
- Read the summary report and implement the fix
- Delegate to `tester` agent to run tests again
- If tests fail, fix them and repeat from Step 4

#### 7. Session Management
- `/myai:pause` — save session state before ending work
- `/myai:resume` — restore context at start of new session
- `/myai:progress` — check project status and next action
- `/myai:verify` — validate goal achievement after completing a phase
