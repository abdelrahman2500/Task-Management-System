# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: comments.spec.ts >> Comments >> should list comments on a task via API
- Location: e2e\tests\comments.spec.ts:58:3

# Error details

```
Error: Failed to create project: {"success":false,"error":{"code":"RATE_LIMIT_EXCEEDED","message":"Too many requests. Please try again later."}}
```

# Test source

```ts
  1   | /**
  2   |  * Database/Test Data Management Fixtures
  3   |  *
  4   |  * Provides helpers for:
  5   |  * - Creating and managing test data via API
  6   |  * - Cleaning up test data after tests
  7   |  * - Seeding database with consistent test data
  8   |  */
  9   | 
  10  | import type { AuthTokens } from "./auth";
  11  | 
  12  | const API_URL =
  13  |   process.env.PLAYWRIGHT_TEST_API_URL || "http://localhost:3000/api/v1";
  14  | 
  15  | interface ApiEnvelope<T> {
  16  |   success: boolean;
  17  |   data: T;
  18  | }
  19  | export interface TestProject {
  20  |   id: number;
  21  |   name: string;
  22  |   description?: string;
  23  | }
  24  | export interface TestTask {
  25  |   id: number;
  26  |   title: string;
  27  |   status: string;
  28  |   priority: string;
  29  | }
  30  | export interface TestComment {
  31  |   id: number;
  32  |   body: string;
  33  |   taskId: number;
  34  | }
  35  | export interface TestProjectMember {
  36  |   id: number;
  37  |   userId: number;
  38  |   role: string;
  39  | }
  40  | 
  41  | async function responseData<T>(response: Response): Promise<T> {
  42  |   return ((await response.json()) as ApiEnvelope<T>).data;
  43  | }
  44  | 
  45  | /**
  46  |  * Fetch helper with auth token
  47  |  */
  48  | async function apiRequest(
  49  |   method: string,
  50  |   endpoint: string,
  51  |   token?: string,
  52  |   body?: unknown,
  53  | ): Promise<Response> {
  54  |   const headers: Record<string, string> = {
  55  |     "Content-Type": "application/json",
  56  |   };
  57  | 
  58  |   if (token) {
  59  |     headers["Authorization"] = `Bearer ${token}`;
  60  |   }
  61  | 
  62  |   const options: RequestInit = {
  63  |     method,
  64  |     headers,
  65  |   };
  66  | 
  67  |   if (body) {
  68  |     options.body = JSON.stringify(body);
  69  |   }
  70  | 
  71  |   return fetch(`${API_URL}${endpoint}`, options);
  72  | }
  73  | 
  74  | /**
  75  |  * Create a project
  76  |  */
  77  | export async function createProject(
  78  |   token: string,
  79  |   projectData: {
  80  |     name: string;
  81  |     description?: string;
  82  |     status?: string;
  83  |   },
  84  | ): Promise<TestProject> {
  85  |   const response = await apiRequest("POST", "/projects", token, projectData);
  86  | 
  87  |   if (!response.ok) {
  88  |     const error = await response.json();
> 89  |     throw new Error(`Failed to create project: ${JSON.stringify(error)}`);
      |           ^ Error: Failed to create project: {"success":false,"error":{"code":"RATE_LIMIT_EXCEEDED","message":"Too many requests. Please try again later."}}
  90  |   }
  91  | 
  92  |   return responseData<TestProject>(response);
  93  | }
  94  | 
  95  | /**
  96  |  * Get a project by ID
  97  |  */
  98  | export async function getProject(
  99  |   token: string,
  100 |   projectId: number,
  101 | ): Promise<TestProject> {
  102 |   const response = await apiRequest("GET", `/projects/${projectId}`, token);
  103 | 
  104 |   if (!response.ok) {
  105 |     throw new Error(`Failed to get project ${projectId}`);
  106 |   }
  107 | 
  108 |   return responseData<TestProject>(response);
  109 | }
  110 | 
  111 | /**
  112 |  * Delete a project
  113 |  */
  114 | export async function deleteProject(
  115 |   token: string,
  116 |   projectId: number,
  117 | ): Promise<void> {
  118 |   const response = await apiRequest("DELETE", `/projects/${projectId}`, token);
  119 | 
  120 |   if (!response.ok) {
  121 |     throw new Error(`Failed to delete project ${projectId}`);
  122 |   }
  123 | }
  124 | 
  125 | /**
  126 |  * Create a task
  127 |  */
  128 | export async function createTask(
  129 |   token: string,
  130 |   projectId: number,
  131 |   taskData: {
  132 |     title: string;
  133 |     description?: string;
  134 |     status?: string;
  135 |     priority?: string;
  136 |     dueDate?: string;
  137 |     assigneeId?: number;
  138 |   },
  139 | ): Promise<TestTask> {
  140 |   const response = await apiRequest(
  141 |     "POST",
  142 |     `/tasks/project/${projectId}`,
  143 |     token,
  144 |     taskData,
  145 |   );
  146 | 
  147 |   if (!response.ok) {
  148 |     const error = await response.json();
  149 |     throw new Error(`Failed to create task: ${JSON.stringify(error)}`);
  150 |   }
  151 | 
  152 |   return responseData<TestTask>(response);
  153 | }
  154 | 
  155 | /**
  156 |  * Get a task by ID
  157 |  */
  158 | export async function getTask(
  159 |   token: string,
  160 |   taskId: number,
  161 | ): Promise<TestTask> {
  162 |   const response = await apiRequest("GET", `/tasks/${taskId}`, token);
  163 | 
  164 |   if (!response.ok) {
  165 |     throw new Error(`Failed to get task ${taskId}`);
  166 |   }
  167 | 
  168 |   return responseData<TestTask>(response);
  169 | }
  170 | 
  171 | /**
  172 |  * Update a task
  173 |  */
  174 | export async function updateTask(
  175 |   token: string,
  176 |   taskId: number,
  177 |   taskData: Partial<{
  178 |     title: string;
  179 |     description: string;
  180 |     status: string;
  181 |     priority: string;
  182 |     dueDate: string;
  183 |     assigneeId: number;
  184 |   }>,
  185 | ): Promise<TestTask> {
  186 |   const response = await apiRequest("PUT", `/tasks/${taskId}`, token, taskData);
  187 | 
  188 |   if (!response.ok) {
  189 |     const error = await response.json();
```