import { upsertUser, getUserById } from '../db/users.js';

export async function syncUser(req, res) {
  const { id, email } = req.user;
  const { name, avatar_url, provider } = req.body;

  const user = await upsertUser({
    id,
    email,
    name: name ?? req.user.user_metadata?.full_name ?? null,
    avatar_url: avatar_url ?? req.user.user_metadata?.avatar_url ?? null,
    provider: provider ?? req.user.app_metadata?.provider ?? 'email',
  });

  res.json(user);
}

export async function getMe(req, res) {
  const user = await getUserById(req.user.id);
  res.json(user);
}
