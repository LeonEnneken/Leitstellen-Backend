export interface Payload {
  sub: string;
  role: 'USER' | 'MODERATOR' | 'ADMINISTRATOR';
  permissions: string[];
}