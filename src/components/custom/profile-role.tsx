interface RoleProfileProps {
    cargo: "admin" | "operador" | "presidente";
  }
export default function RoleProfile(cargo: RoleProfileProps) {
  return (
    <div>
      <h2>{cargo.cargo}</h2>
    </div>
  )
}
