# KDVC — Sistema de Controle de Presença

Sistema para gerenciamento de presença em aulas universitárias da UFCG, composto por um servidor REST (NestJS) e um aplicativo mobile (React Native).

* Setup do servidor → [`server/README.md`](./server/README.md)
* Setup do mobile → [`mobile/README.md`](./mobile/README.md)

> O servidor roda por padrão na porta `8000`. Documentação interativa (Swagger): `http://localhost:8000/docs`

---

## Autenticação

Rotas protegidas exigem o header:

```
Authorization: Bearer <access_token>
```

Os tokens são JWT emitidos pelo próprio servidor, com validade de **7 dias** (access) e **30 dias** (refresh).

**Restrição de domínio de e-mail (login via Google):**

| Domínio | Role atribuída |
|---|---|
| `@ccc.ufcg.edu.br` | `STUDENT` |
| `@computacao.ufcg.edu.br` / `@dsc.ufcg.edu.br` | `TEACHER` |
| Outros | ❌ Acesso negado |

---

## Resumos dos Endpoints

### Auth — `/auth`

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/auth/login` | ❌ | Login com e-mail e senha. Retorna `access_token` e dados do usuário. |
| POST | `/auth/refresh` | ❌ | Troca um `refresh_token` válido por um novo `access_token`. |
| GET | `/auth/me` | ✅ | Retorna o perfil do usuário autenticado (dados do próprio token). |
| POST | `/auth/google/login` | ❌ | Login via Google para o mobile. Recebe o `id_token` do Google e retorna tokens internos. Cria o usuário automaticamente se for o primeiro acesso. |
| GET | `/auth/google/callback` | ❌ | Callback OAuth do Google (fluxo web). Recebe o `code` como query param. |

---

### Usuários — `/users`

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| POST | `/users` | ❌ | Cria um novo usuário (professor ou aluno) com e-mail e senha. |
| GET | `/users/:id` | ✅ | Retorna os dados de um usuário pelo ID. |
| PATCH | `/users/:id` | ✅ | Atualiza dados do próprio usuário (nome, e-mail, foto etc.). Apenas o próprio usuário pode se editar. |
| DELETE | `/users/:id` | ✅ | Remove a conta do próprio usuário. |

---

### Disciplinas — `/courses`

| Método | Rota | Auth | Role | Descrição |
|---|---|---|---|---|
| POST | `/courses` | ✅ | TEACHER | Cria uma disciplina. O professor autenticado é definido como dono. Aceita horários e e-mails de alunos opcionalmente. |
| GET | `/courses` | ✅ | Qualquer | Lista disciplinas. Professor vê as suas; aluno vê as em que está matriculado. |
| GET | `/courses/:id` | ✅ | Qualquer | Detalha uma disciplina com alunos, aulas e horários. Alunos veem o campo `present` em cada aula. |
| PATCH | `/courses/:id` | ✅ | TEACHER | Atualiza nome, descrição ou foto da disciplina. Apenas o professor dono. |
| DELETE | `/courses/:id` | ✅ | TEACHER | Remove a disciplina. Apenas o professor dono. |
| POST | `/courses/:id/students` | ✅ | TEACHER | Matricula um aluno pelo ID. |
| POST | `/courses/:id/students/batch` | ✅ | TEACHER | Matricula múltiplos alunos por e-mail. Cria a conta automaticamente se o aluno ainda não existir. |
| GET | `/courses/:id/students` | ✅ | TEACHER | Lista os alunos matriculados na disciplina. |
| DELETE | `/courses/:id/students/:studentId` | ✅ | TEACHER | Remove a matrícula de um aluno. |
| GET | `/courses/:id/classes` | ✅ | Qualquer | Lista todas as aulas da disciplina com as presenças registradas. |

---

### Aulas — `/classes`

| Método | Rota | Auth | Role | Descrição |
|---|---|---|---|---|
| POST | `/classes` | ✅ | TEACHER | Cria uma aula para uma disciplina (tópico, data e `courseId`). |
| GET | `/classes/:id` | ✅ | Qualquer | Retorna os dados de uma aula com a lista de presenças. |
| PATCH | `/classes/:id` | ✅ | TEACHER | Atualiza tópico, data ou disciplina de uma aula. |
| DELETE | `/classes/:id` | ✅ | TEACHER | Remove uma aula. |
| POST | `/classes/:id/attendance` | ✅ | Qualquer | Registra presença. Alunos registram a si mesmos; professores informam o `studentId`. |
| DELETE | `/classes/:id/attendance/:studentId` | ✅ | TEACHER | Remove a presença de um aluno de uma aula. |