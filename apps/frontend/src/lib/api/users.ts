import { Position } from "../../../app/logs/types"

export async function updateUserPosition(
  userId: number,
  newPosition: Position,
  token: string,
) {
  const response = await fetch(`/api/users/${userId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ position: newPosition }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || "Failed to update user position")
  }
  return response.json()
}
