const endpointsRoles = {
  merchandiser: {
    GET: [
      "^profile$",
      "^profile/reports$",
      "^clients$",
      "^branches$",
      "^chains$",
      "^categories$",
      "^products$",
      "^products/:id$"
    ],
    POST: [
      "^reports$"
    ]
  },
  client: {
    GET: [
      "^profile$",
      "^profile/reports$",
      "^branches$",
      "^chains$",
      "^categories$",
      "^periods$",
      "^reports$"
    ]
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
      "^products/:id$"
    ],
    POST: [
      "^reports$",
      "^clients$",
      "^branches$",
      "^chains$",
      "^periods$",
      "^products$",
    ],
    PUT: [
      "^profile$",
      "^reports/:id$",
      "^clients$/:id",
      "^branches/:id$",
      "^chains/:id$",
      "^products/:id$"
    ],
    PATCH: [
      "^profile$",
      "^reports/:id$",
      "^clients$/:id",
      "^branches/:id$",
      "^chains/:id$",
      "^products/:id$"
    ]
  }
}

module.exports = {
  endpointsRoles
}