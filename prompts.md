## Prompt Log

### Entry 001
- **Tool:** Claude Opus 4.8
- **Goal:** Set up a prompt-logging workflow in prompts.md
- **Prompt:** "I want to add prompts in prompts.md file in current folder. Current folder is empty currently. Whenever I am done with a prompt and its outcome, I want you to add the prompt I used and the outcome as well (crisp but understanble). You can start with current prompt as well. Here is the format for one prompt. In tool you can also mention the model that you are using. and also keep this thing in your memory so that you will auto do it after every prompt."
- **Outcome:** Created prompts.md with this entry. Saved memory to auto-append every future prompt and outcome.

### Entry 002
- **Tool:** Claude Sonnet 4.6
- **Goal:** Fix prompt logging to preserve exact prompt text
- **Prompt:** "I see that you have little modified the prompt, I want you to add excat prompt that I types not modify it, you can generate crisp and understandable outcome, but prompt must be as it is."
- **Outcome:** Fixed Entry 001 to use exact original prompt text. Updated memory rule to preserve prompts verbatim.

### Entry 003
- **Tool:** Claude Sonnet 4.6
- **Goal:** Format prompts.md — bold keys, single line per field
- **Prompt:** "added some changes, make the keys bold eg: tool, goal etc. and every point must come as one line in MD preview"
- **Outcome:** Rewrote all entries with bold keys and single-line fields.

### Entry 004
- **Tool:** Claude Sonnet 4.6
- **Goal:** Switch entry fields to bullet points
- **Prompt:** "use bullet points"
- **Outcome:** Reformatted all entries to use bullet points for each field. Updated memory format.

### Entry 005
- **Tool:** Claude Opus 4.8
- **Goal:** Plan project setup for an extensible API Docs + Sandbox SPA (setup only, hello world)
- **Prompt:** "Lets do the real work now. I want to create a API Docs SPA where external developers can see the APIs and test them in sandbox. I am attaching a pdf for more info on it. The stack & expected filestructure are also mentioned in the pdf. \n\nIn addition to that, the tanstack query must act as DAL, I want the data source to be extensible, we should be able to swap the data source to rest api, graphql api, localstorage, local json files. The DAL must abstract the data source from app, just use the data. \n\nSame abstraction I need to do with Auth, where I can use any auth provider like supabase, firebase, auth0 or any auth provider, and also Custom JWT as well. \n\nBut for sandbox API execution by external devs (users), it must always be rest api.\n\nFor now I just wanted to setup the project, not implement any feature. I should be able to run with a hello world page."
- **Polls (AskUserQuestion):**
  - Router? → **TanStack Router v1**
  - UI state library? → **Zustand**
  - Abstraction scope for setup phase? → **Interfaces + mock default**
  - Styling? → **Tailwind CSS v4**
- **Outcome:** Produced setup plan: Vite + React + TS strict, TanStack Router/Query, Zustand, Tailwind v4, DAL + Auth abstraction layers with mock defaults, sandbox always-REST, hello-world page. Plan snapshot → [plans/plan-v1.md](plans/plan-v1.md).

### Entry 006
- **Tool:** Claude Opus 4.8
- **Goal:** Decide sandbox + TanStack Query strategy; add poll logging + plan versioning to workflow
- **Prompt:** "Can we also use tanstack query's mutation or queries with Sandbox? it must decide if mutation (POST, PUT, DELETE) or Query (GET) based on API method. Or correct me if I wrongly mentioned the order. \n\nPlus in Prompt.md. mention all polls through which you asked me the questions. And add every plan version as md in a separate folder with a version number and mention that versioned plan doc in it's respective prompt outcome."
- **Polls (AskUserQuestion):**
  - Sandbox hook strategy? → **useMutation for all verbs** (imperative one-shot; HTTP method is just a request field to the REST client, not the hook selector)
- **Outcome:** Corrected the axis from verb-based to imperative-vs-declarative — sandbox uses `useMutation` for every verb. Added workflow rules: log polls in entries + save every plan revision as `plans/plan-vN.md` referenced from its entry. Plan snapshot → [plans/plan-v2.md](plans/plan-v2.md).

### Entry 007
- **Tool:** Claude Opus 4.8
- **Goal:** Choose adapter-selection mechanism for DAL/Auth
- **Prompt:** "shouldn't we select DAL/Auth adapters via config instead of env vars? WDYT?"
- **Outcome:** Agreed. Adapter selection moved to a typed `appConfig` single-source-of-truth + type-safe adapter registries (`Record<Kind, () => Adapter>`, exhaustively type-checked); env vars reserved for provider secrets/overrides. Also unlocks the runtime multi-environment switcher bonus. Plan approved. Plan snapshot → [plans/plan-v3.md](plans/plan-v3.md).
