export function validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

export function validatePassword(password: string): boolean {
    return password.length >= 6; // Example: Password must be at least 6 characters long
}

export function validateUsername(username: string): boolean {
    const re = /^[a-zA-Z0-9_]{3,30}$/; // Example: Username must be 3-30 characters long and can include letters, numbers, and underscores
    return re.test(username);
}

export function validateResumeData(data: any): boolean {
    // Example validation logic for resume data
    return data && typeof data === 'object' && 'name' in data && 'experience' in data;
}