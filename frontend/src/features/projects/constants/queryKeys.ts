export const projectKeys = {
  all: ["projects"] as const,

  detail: (id: number) => ["projects", id] as const,
};
