// Auth user shape (Firebase user projected into the app).
// Domain/data types live in src/data/types.ts.
export interface User {
  id: string
  email: string
  displayName?: string
  photoURL?: string
}
