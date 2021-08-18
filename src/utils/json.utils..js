var { Validator } = require('jsonschema');

const reportSchema = (report) => {
  let categories = {}
  if (report.type == "photographic") {
    categories = {
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
            }
          }
        }
      }
    }
  } else if (report.type == "breakeven") {
    categories = {
      breakevens: {
        type: "array",
        items: {
          type: "object",
          properties: {
            product: {
              type: "string",
            },
            breakeven: {
              type: "boolean"
            }
          }
        }
      }
    }
  } else {
    categories = {
      pricings: {
        type: "array",
        items: {
          type: "object",
          properties: {
            product: {
              type: "string",
            },
            price: {
              type: "number"
            }
          }
        }
      }
    }
  }

  return {
    id: "/report",
    type: "object",
    required: ["chainId", "clientId", "branchId", "isComplete", "type", "location", "categories",],
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
            ...categories
          }
        }
      }
    }
  }
}

var validator = new Validator();

const validateReport = (report) => validator.validate(report, reportSchema(report));

module.exports = {
  validateReport
}