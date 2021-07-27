const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const dbpath = path.join(__dirname, "todoApplication.db");
const app = express();
app.use(express.json());
let db = null;

const initialize = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initialize();
const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
app.get("/todos/", async (request, response) => {
  let datainfo = "";
  let kk = null;
  const { search_q = "", priority, status } = request.query;
  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      datainfo = `SELECT *
                    FROM todo
                    WHERE todo LIKE '%${search_q}%'
                     AND priority='${priority}' AND 
                     status='${status}';`;
      break;
    case hasStatusProperty(request.query):
      datainfo = `SELECT *
                    FROM todo
                    WHERE todo LIKE '%${search_q}%'
                     AND 
                     status='${status}';`;
      break;
    case hasPriorityProperty(request.query):
      datainfo = `SELECT *
                    FROM todo
                    WHERE todo LIKE '%${search_q}%'
                     AND 
                     priority='${priority}';`;
      break;
    default:
      datainfo = `SELECT *
                    FROM todo
                    WHERE todo LIKE '%${search_q}%';`;
  }
  kk = await db.all(datainfo);
  response.send(kk);
});

app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const query = `SELECT *
                    FROM todo
                    WHERE Id=${todoId};`;
  const kk1 = await db.get(query);
  response.send(kk1);
});

app.post("/todos/", async (request, response) => {
  const { id, status, priority, todo } = request.body;
  const query = `INSERT INTO todo(id,todo,priority,status)
                    Values(${id},'${todo}','${priority}','${status}');`;
  await db.run(query);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let message = "";
  let requestbody = request.body;
  switch (true) {
    case requestbody.status !== undefined:
      message = "Status";
      break;
    case requestbody.todo !== undefined:
      message = "Todo";
      break;
    case requestbody.priority !== undefined:
      message = "Priority";
      break;
  }
  const updateQuery = `SELECT *
                    FROM todo
                    WHERE id=${todoId};`;
  const result = await db.get(updateQuery);

  const {
    todo = result.todo,
    priority = result.priority,
    status = result.status,
  } = request.body;

  update = `UPDATE todo
            SET priority='${priority}',
                status='${status}',
                todo='${todo}'
            
            WHERE id=${todoId};`;
  await db.run(update);
  response.send(`${message} Updated`);
});
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`;

  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});
module.exports = app;
