var { Validator } = require('jsonschema');

const reportSchema = {
  id: "/report",
  type: "object",
  required: ["chainId", "clientId", "branchId", "createdAt", "isComplete", "type", "location", "categories",],
  properties: {
    chainId: {
      type: "string"
    },
    clientId: {
      type: "string"
    },
    branchId: {
      type: "string"
    },
    createdAt: {
      type: "integer",
      minimum: 1
    },
    isComplete: {
      type: "boolean"
    },
    type: {
      type: "string",
      pattern: /\b(photographic|breakeven|pricing)\b/gi
    },
    location: {
      type: "object",
      properties: {
        latitude: {
          type: "interget"
        },
        longitude: {
          type: "interget"
        }
      }
    },
    categories: {
      type: "array",
      items: {
        type: "object",
        properties: {
          category: {
            type: "string"
          },
          withoutStock: {
            type: "boolean"
          },
          badCategory: {
            type: "boolean"
          },
          images: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                },
                type: {
                  type: "string",
                  pattern: /\b(primary|secondary)\b/gi
                },
                comment: {
                  type: "string"
                },
                uri: {
                  type: "string"
                }
              }
            }
          }
        }
      }
    }
  },
}

var validator = new Validator();

const validateReport = (report) => validator.validate(report, reportSchema);

module.exports = {
  validateReport
}