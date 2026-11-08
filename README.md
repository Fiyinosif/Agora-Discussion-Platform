# Agora — Thread-Based Discussion Platform

Agora is a thread-based social platform where users connect over shared interests, start discussion topics, and hold meaningful, well-moderated conversations. Discussions can be public for anyone to discover or private for a small invited group, and every discussion is organised by tags so users can find the topics they care about.

Built as a team project for **CMPS 285** at Southeastern Louisiana University.

## Features

- **Discussions** — Create discussion topics, join public discussions, or get invited to private ones (no member limit on public discussions)
- **Threaded responses** — Reply to the head topic or to other responses; conversations stay structured through a self-referencing discussion model
- **Tags & discovery** — Filter the homepage by title, recency, or tags; create your own custom tags; a trending sidebar ranks discussions by recency, likes, and member count
- **Follow users** — Follow other users to stay updated on the new discussions they create
- **Role-based moderation** — Every discussion has owners, admins, and members with different levels of access (see Roles & Permissions below)
- **Bans & invites** — Admins and owners can invite members and ban users temporarily or permanently

## Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React, TypeScript, Mantine UI |
| Backend  | C#, ASP.NET Core REST API, Swagger (API documentation & testing) |
| Database | Microsoft SQL Server (10 tables) |
| Tooling  | Git & GitHub — feature branches and pull requests |

## How It Works

The React frontend communicates with the C# REST API over HTTPS/HTTP requests. The API handles all business logic — discussions, tags, users, roles, responses, and follow relationships — and reads/writes everything to SQL Server.

```text
React + TypeScript frontend  ──HTTP──▶  ASP.NET Core REST API (C#)  ──▶  SQL Server
     (Mantine UI)                          discussions · tags · users        (10 tables)
                                           roles · responses · follows
```

### Database design highlights

- **10 tables**, with `Discussions` at the centre and tags, banned users, members, and settings related to it
- Head topics and responses are both stored as discussions: a head topic has a `ParentId` of `NULL`, and a response's `ParentId` points to the discussion it replies to — one table powers the whole threading model
- Follow relationships are stored in their own table with distinct `FollowingId` and `FollowerId` user references

## Roles & Permissions

| Capability                        | Member | Admin | Owner |
|-----------------------------------|:------:|:-----:|:-----:|
| View & join discussions           |   ✓    |   ✓   |   ✓   |
| Post threaded responses           |   ✓    |   ✓   |   ✓   |
| Delete responses                  |        |   ✓   |   ✓   |
| Ban members (temporary/permanent) |        |   ✓   |   ✓   |
| Invite members                    |        |   ✓   |   ✓   |
| Ban admins                        |        |       |   ✓   |
| Change member roles               |        |       |   ✓   |
| Manage discussion settings        |        |       |   ✓   |
| Delete the discussion             |        |       |   ✓   |

## Getting Started

**Prerequisites:** .NET SDK (for the ASP.NET Core API), Node.js, and access to a SQL Server instance (local, remote, or cloud).

1. Clone the repository
2. Create the database from the SQL schema and update the API's connection string
3. Start the backend API — Swagger UI is available for exploring and testing endpoints
4. In the frontend folder, run `npm install`, then `npm run dev`
5. Open the app, create an account, and start or join a discussion

## Non-Functional Requirements

- Secure communication over **HTTPS**, with authentication required for personalised content
- Role-based authorisation enforced on discussion actions; no sensitive information exposed in client-side code
- Availability target of **99%** outside scheduled maintenance, with clear error messages on server/database issues
- Modular backend endpoints and reusable UI components, so new features can be added without breaking existing functionality

## Scope

**In scope:** user accounts, public & private discussions, threaded responses, tag-based search and filtering, role-based permissions, basic moderation.

**Future work (out of scope for this version):** media uploads, real-time chat, mobile applications, advanced analytics.

## Team

| Member | Role |
|--------|------|
| **Fiyinfoluwa Osifala** | Team Lead |
| Rhett Hill | Developer |
| Ashante Harris | Developer |
| David Bestman | Developer |

Client: CMPS 285 course instructor. Project documentation includes a Software Requirements Specification and a Feasibility Study covering requirements, system design, milestones (requirements → design → development → testing → final delivery), and risk analysis.
