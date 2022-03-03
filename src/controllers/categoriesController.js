import connection from "../db.js";

export async function registerCategory(req, res) {
  const category = req.body;
  if(category.name === " "){
    res.sendStatus(400);
    return;
  }

  try {
    const queryCategories = await connection.query(`SELECT * FROM categories`);
    const seacherdCategory = queryCategories.rows.find(queryCategory => queryCategory.name === category.name);

    if(seacherdCategory === undefined){
      await connection.query(`
        INSERT INTO categories (name)
        VALUES ($1)
      `, [category.name]);
  
      res.sendStatus(201);
    }else{
      res.sendStatus(409);
      return;
    }

  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

export async function getCategories(req, res) {
  try {
    const queryCategories = await connection.query(`SELECT * FROM categories`);
    
    res.send(queryCategories.rows);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}