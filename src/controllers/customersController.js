import connection from "../db.js";
import dayjs from "dayjs";

export async function registerCustomer(req, res) {
  const customer = req.body;
  if (customer.name === " ") {
    res.sendStatus(400);
    return;
  }

  try {
    const queryCustomers = await connection.query(`SELECT * FROM customers`);
    const searchedCustomer = queryCustomers.rows.find(queryCustomer => queryCustomer.cpf === customer.cpf);

    if (searchedCustomer === undefined) {
      await connection.query(`
        INSERT INTO customers 
          (name, phone, cpf, birthday)
        VALUES 
          ($1, $2, $3, $4)
      `, [customer.name, customer.phone, customer.cpf, dayjs(customer.birthday).format('YYYY-MM-DD')]);

      res.sendStatus(201);
    } else {
      res.sendStatus(409);
      return;
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

export async function getCustomers(req, res) {
  const cpf = req.query.cpf;

  try {
    let offset = '';
    if (req.query.offset) {
      offset = `OFFSET ${req.query.offset}`;
    }

    let limit = '';
    if (req.query.limit) {
      limit = `LIMIT ${req.query.limit}`;
    }

    const orderByFilter = {
      id: 1,
      name: 2,
      phone: 3,
      cpf: 4,
      birthday: 5
    }
    let orderBy = 'ORDER BY customers.id';
    if (req.query.order && orderByFilter[req.query.order] && req.query.desc === undefined) {
      orderBy = `ORDER BY ${orderByFilter[req.query.order]}`;
    } else if (req.query.order && orderByFilter[req.query.order] && req.query.desc){
      orderBy = `ORDER BY ${orderByFilter[req.query.order]} DESC`;
    }

    if (cpf === undefined) {
      const queryCustomers = await connection.query(`
        SELECT 
          customers.*,
          COUNT(rentals.id) "rentCount" 
        FROM customers
          LEFT JOIN rentals ON customers.id=rentals."customerId"
        GROUP BY customers.id
        ${orderBy}
          ${offset}
          ${limit}
      `);
      const customersReader = queryCustomers.rows.map(customer => (
        { 
          ...customer, 
          birthday: dayjs(customer.birthday).format('YYYY-MM-DD') 
        }
      ));

      res.send(customersReader);
    } else {
      const queryCustomersCase = await connection.query(`
        SELECT * FROM customers
        WHERE cpf LIKE $1
      `, [`${cpf}%`]);

      res.send(queryCustomersCase.rows);
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

export async function getCustomer(req, res) {
  const id = parseInt(req.params.id);

  try {
    const queryCustomers = await connection.query(`SELECT * FROM customers`);
    const searchedCustomer = queryCustomers.rows.find(queryCustomer => queryCustomer.id === id);

    if (searchedCustomer !== undefined) {
      const queryCustomer = await connection.query(`
        SELECT * FROM customers 
        WHERE id=$1
      `, [id]);
      const customer = { 
        ...queryCustomer.rows[0], 
        birthday: dayjs(queryCustomer.rows[0].birthday).format('YYYY-MM-DD') 
      };

      res.send(customer);
    } else {
      res.sendStatus(404);
      return;
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

export async function updateCustomer(req, res) {
  const id = parseInt(req.params.id);
  const customer = req.body;

  try {
    await connection.query(`
      UPDATE customers 
      SET name=$1, phone=$2, cpf=$3, birthday=$4
      WHERE customers.id=$5
    `, [customer.name, customer.phone, customer.cpf, dayjs(customer.birthday).format('YYYY-MM-DD'), id]);

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}