export const validateUsername = (value: string): string | null => {
    if (!value) return "Username is required";
    if (value.length < 4 || value.length > 20) return "Username must be between 4 and 20 characters";
    return null;
  };
  
  export const validatePassword = (value: string): string | null => {
    if (!value) return "Password is required";
    if (value.length < 2) return "Password must be at least 2 characters";
    if (!/[a-z]/.test(value)) return "Password should contain at least one lowercase letter.";
    if (!/[A-Z]/.test(value)) return "Password should contain at least one uppercase letter.";
    if (!/[0-9]/.test(value)) return "Password should contain at least one number.";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(value)) return "Password should contain at least one special character.";
    return null;
};
  
  export const validateNickname = (value: string): string | null => {
    if (!value) return "Nickname is required";
    // Pas d'autres règles spécifiques pour le surnom dans vos DTOs
    return null;
  };
  
  export const validateLoginUsername = (value: string): string | null => {
    if (!value) return "Username is required";
    return null;
};

export const validateLoginPassword = (value: string): string | null => {
    if (!value) return "Password is required";
    return null;
};