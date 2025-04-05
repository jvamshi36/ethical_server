import { EntitySchema } from "typeorm";

const Headquarters = new EntitySchema({
  name: "Headquarters",
  tableName: "headquarters",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid"
    },
    name: {
      type: "varchar"
    },
    location: {
      type: "varchar"
    },
    region: {
      type: "varchar"
    },
    country: {
      type: "varchar"
    },
    createdAt: {
      type: "timestamp",
      createDate: true
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true
    }
  },
  relations: {
    departments: {
      type: "one-to-many",
      target: "Department",
      inverseSide: "headquarters"
    },
    users: {
      type: "one-to-many",
      target: "User",
      inverseSide: "headquarters"
    },
    expenses: {
      type: "one-to-many",
      target: "Expense",
      inverseSide: "headquarters"
    }
  }
});

export { Headquarters };