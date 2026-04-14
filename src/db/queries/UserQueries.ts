import { DbClient } from '../DbClient';

export interface UserRow {
  id: string;
  email: string;
  full_name: string;
  role: 'customer' | 'admin';
  is_active: boolean;
  created_at: Date;
}

export class UserQueries {
  constructor(private readonly db: DbClient) {}

  async findByEmail(email: string): Promise<UserRow | null> {
    return this.db.findOne<UserRow>(
      `SELECT id, email, full_name, role, is_active, created_at
       FROM users
       WHERE email = $1`,
      [email],
    );
  }

  async findById(id: string): Promise<UserRow | null> {
    return this.db.findOne<UserRow>(
      `SELECT id, email, full_name, role, is_active, created_at
       FROM users
       WHERE id = $1`,
      [id],
    );
  }

  async countByEmail(email: string): Promise<number> {
    const row = await this.db.findOne<{ count: string }>(
      'SELECT COUNT(*) AS count FROM users WHERE email = $1',
      [email],
    );
    return parseInt(row?.count ?? '0', 10);
  }

  async hardDeleteByEmail(email: string): Promise<void> {
    await this.db.query('DELETE FROM users WHERE email = $1', [email]);
  }
}
