export type Result<T, E = string> = { type: "success"; value: T } | { type: "error"; error: E };

export function success<T, E = string>(value: T): Result<T, E> {
  return { type: "success", value };
}

export function error<T, E = string>(error: E): Result<T, E> {
  return { type: "error", error };
}

export function isSuccess<T, E = string>(
  result: Result<T, E>
): result is { type: "success"; value: T } {
  return result.type === "success";
}

export function isError<T, E = string>(
  result: Result<T, E>
): result is { type: "error"; error: E } {
  return result.type === "error";
}
