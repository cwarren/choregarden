// User service for managing application users
import { Pool } from 'pg';

export interface User {
  id: string;
  cognitoUserId: string;
  email: string;
  displayName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface CreateUserData {
  cognitoUserId: string;
  email: string;
  displayName?: string;
}

export class UserService {
  constructor(private db: Pool) {}

  async findByCognitoId(cognitoUserId: string): Promise<User | null> {
    const result = await this.db.query(
      'SELECT * FROM users WHERE cognito_user_id = $1',
      [cognitoUserId]
    );
    return result.rows[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const { cognitoUserId, email, displayName } = userData;
    
    const result = await this.db.query(
      `INSERT INTO users (cognito_user_id, email, display_name) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [cognitoUserId, email, displayName]
    );
    
    return result.rows[0];
  }

  async updateLastLogin(cognitoUserId: string): Promise<void> {
    await this.db.query(
      'UPDATE users SET last_login_at = NOW() WHERE cognito_user_id = $1',
      [cognitoUserId]
    );
  }

  async updateUser(cognitoUserId: string, updates: Partial<User>): Promise<User | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.displayName !== undefined) {
      fields.push(`display_name = $${paramCount++}`);
      values.push(updates.displayName);
    }

    if (fields.length === 0) return null;

    // Always update the updated_at timestamp
    fields.push(`updated_at = NOW()`);
    values.push(cognitoUserId);
    
    const result = await this.db.query(
      `UPDATE users SET ${fields.join(', ')} 
       WHERE cognito_user_id = $${paramCount} 
       RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  // Just-in-time user creation from Cognito JWT
  async getOrCreateUserFromToken(decodedToken: any): Promise<User> {
    const cognitoUserId = decodedToken.sub;
    const email = decodedToken.email;
    // Default display name to email address instead of Cognito username
    const displayName = email;

    // Try to find existing user
    let user = await this.findByCognitoId(cognitoUserId);
    
    if (!user) {
      // Create new user if doesn't exist
      user = await this.createUser({
        cognitoUserId,
        email,
        displayName: displayName
      });
      console.log(`Created new user: ${email} (${cognitoUserId})`);
    }

    // Update last login for both new and existing users
    await this.updateLastLogin(cognitoUserId);

    return user;
  }
}
