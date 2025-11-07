import { Position } from '../dto/position.enum';

export class User {
  id: number;
  email: string;
  githubUsername: string | null;
  fullName: string;
  position: Position;
  createdAt: Date;
}
