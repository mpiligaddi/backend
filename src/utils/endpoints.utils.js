const endpointsRoles = {
  merchandiser: {
    GET: [
      "profile",
      "profile/reports",
      "clients",
      "branches",
      "chains",
      "categories"
    ],
    POST: [
      "reports"
    ]
  },
  client: {
    GET: [
      "profile",
      "profile/reports",
      "branches",
      "chains",
      "categories",
      "periods",
      "reports"
    ]
  },
  backoffice: {
    GET: [
      "profile",
      "profile/reports",
      "clients",
      "clients/:id",
      "branches",
      "branches/:id",
      "chains",
      "chains/:id",
      "categories",
      "periods"
    ],
    POST: [
      "reports"
    ],
    PUT: [
      "reports",
      "profile",
      "clients",
      "branches",
      "chains"
    ],
    PATCH: [
      "reports",
      "profile",
      "clients",
      "branches",
      "chains"
    ]
  }
}

module.exports = {
  endpointsRoles
}