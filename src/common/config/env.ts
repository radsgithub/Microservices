// Fail fast on missing critical secrets instead of falling back to insecure
// defaults (previously the code fell back to 'secret123' and a hardcoded Atlas
// URI, which is a security hole).

export function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value || value.trim() === '') {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

export function getJwtSecret(): string {
    return requireEnv('JWT_SECRET');
}
