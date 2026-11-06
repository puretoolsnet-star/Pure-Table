export type EcosystemProjectId = "purepdf" | "pureQr" | "pureSign" | "pureTable";

export type EcosystemProjectStatus = "active" | "comingSoon";

export type EcosystemProjectMeta = {
  id: EcosystemProjectId;
  status: EcosystemProjectStatus;
  href?: string;
  external?: "purepdf" | "pureQr" | "pureSign";
  current?: boolean;
};

/**
 * Order: PurePDF → PureQR → PureSign → PureTable.
 * PureTable is the current app.
 */
export const ECOSYSTEM_PROJECTS: EcosystemProjectMeta[] = [
  { id: "purepdf", status: "active", external: "purepdf" },
  { id: "pureQr", status: "active", external: "pureQr" },
  { id: "pureSign", status: "active", external: "pureSign" },
  { id: "pureTable", status: "active", href: "/", current: true },
];
