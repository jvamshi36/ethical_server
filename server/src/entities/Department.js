import { EntitySchema } from "typeorm";

const Department = new EntitySchema({
  name: "Department",
  tableName: "departments",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid"
    },
    name: {
      type: "varchar"
    },
    headquartersId: {
      type: "uuid"
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
    headquarters: {
      type: "many-to-one",
      target: "Headquarters",
      joinColumn: {
        name: "headquartersId"
      }
    },
    users: {
      type: "one-to-many",
      target: "User",
      inverseSide: "department"
    }
  }
});

export { Department };