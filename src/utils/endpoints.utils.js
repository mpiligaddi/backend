const endpointsRoles = {
  merchandiser: {
    GET: ["^profile$", "^profile/reports$", "^clients$", "^branches$", "^chains$", "^categories$", "^products$", "^products/:id$"],
    POST: ["^reports$"],
  },
  client: {
    GET: ["^profile$", "^profile/reports$", "^branches$", "^chains$", "^categories$", "^periods$", "^reports$"],
  },
  backoffice: {
    GET: [
      "^profile$",
      "^profile/reports$",
      "^clients$",
      "^clients/:id$",
      "^branches$",
      "^branches/:id$",
      "^chains$",
      "^chains/:id$",
      "^categories$",
      "^periods$",
      "^products$",
      "^products/:id$",
      "^zones/:id$",
      "^zones$",
      "^reports$",
      "^reports/:id$",
      "^comercials$",
      "^comercials/:id$",
      "^users$",
      "^users/:id$",
      "^coverages$",
      "^coverages/:id$",
      "^formats$",
      "^formats/:id$",
    ],
    POST: ["^reports$", "^clients$", "^branches$", "^chains$", "^periods$", "^products$", "^comercials$", "^coverages$", "^formats$"],
    PUT: ["^profile$", "^reports/:id$", "^clients$/:id", "^branches/:id$", "^chains/:id$", "^products/:id$", "^comercials/:id$", "^users/:id$", "^coverages/:id$", "^formats/:id$"],
    PATCH: [
      "^profile$",
      "^reports/:id$",
      "^clients$/:id",
      "^branches/:id$",
      "^chains/:id$",
      "^products/:id$",
      "^images/:id/favorite$",
      "^reports/:id/revised$",
      "^images/:id/delete$",
      "^comercials/:id$",
      "^users/:id$",
      "^coverages/:id$",
      "^formats/:id$",
    ],
    DELETE: ["^reports/:id$", "^clients$/:id", "^branches/:id$", "^chains/:id$", "^products/:id$", "^comercials/:id$", "^coverages/:id$", "^formats/:id$", "^formats/:id/:chainId$"],
  },
};

module.exports = {
  endpointsRoles,
};
