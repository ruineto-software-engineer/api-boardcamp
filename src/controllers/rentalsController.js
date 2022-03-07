import connection from "../db.js";
import dayjs from "dayjs";

export async function registerRental(req, res) {
  const { customerId, gameId, daysRented } = req.body;
  const rentDate = dayjs().format('YYYY-MM-DD');
  const returnDate = null;
  const delayFee = null;

  if (daysRented < 0 || daysRented === 0) {
    res.sendStatus(400);
    return;
  }

  try {
    const queryCustomer = await connection.query(`
      SELECT * FROM customers WHERE id=$1
    `, [customerId]);
    const validationCustomer = (queryCustomer.rows.length !== 0);

    const queryGame = await connection.query(`
      SELECT games."stockTotal" FROM games WHERE id=$1
    `, [gameId]);
    const validationGame = (queryGame.rows.length !== 0);

    const queryRental = await connection.query(`
      SELECT * FROM rentals 
      WHERE "gameId"=$1 AND "returnDate" IS null
    `, [gameId]);

    if (validationCustomer && validationGame) {
      const validationAvailability = queryGame.rows[0].stockTotal > queryRental.rows.length;

      if (validationAvailability) {
        const pricePerDay = await connection.query(`
          SELECT games."pricePerDay" FROM games WHERE id=$1
        `, [gameId]);
        const originalPrice = pricePerDay.rows[0].pricePerDay * daysRented;

        await connection.query(`
          INSERT INTO rentals 
            ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee")
          VALUES
            ($1, $2, $3, $4, $5, $6, $7)
        `, [customerId, gameId, rentDate, daysRented, returnDate, originalPrice, delayFee]);

        res.sendStatus(201);
      } else {
        res.sendStatus(400);
        return;
      }
    } else {
      res.sendStatus(400);
      return;
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

export async function getRentals(req, res) {
  const customerId = req.query.customerId;
  const gameId = req.query.gameId;

  try {
    if (customerId !== undefined) {
      const queryRentalsCustomerId = await connection.query({
        text: `
          SELECT 
            rentals.*, 
            customers.id AS "customersId", customers.name AS "customersName",
            games.id AS "gamesId", games.name AS "gamesName", games."categoryId",
            categories.name AS "categoryName"
          FROM rentals
            JOIN customers ON customers.id=rentals."customerId"
            JOIN games ON games.id=rentals."gameId"
            JOIN categories ON categories.id=games."categoryId"
          WHERE rentals."customerId"=$1
        `,
        rowMode: 'array'
      }, [customerId]);

      const rentalsReaderCustomerId = queryRentalsCustomerId.rows.map(rental => {
        const [
          id,
          customerId,
          gameId,
          rentDate,
          daysRented,
          returnDate,
          originalPrice,
          delayFee,
          customersId,
          customersName,
          gamesId,
          gamesName,
          categoryId,
          categoryName
        ] = rental;

        return {
          id,
          customerId,
          gameId,
          rentDate: dayjs(rentDate).format('YYYY-MM-DD'),
          daysRented,
          returnDate: returnDate === null ? returnDate : dayjs(returnDate).format('YYYY-MM-DD'),
          originalPrice,
          delayFee,
          customer: {
            id: customersId,
            name: customersName
          },
          game: {
            id: gamesId,
            name: gamesName,
            categoryId,
            categoryName
          }
        }
      });

      res.send(rentalsReaderCustomerId);
    } else if (gameId !== undefined) {
      const queryRentalsGameId = await connection.query({
        text: `
          SELECT 
            rentals.*, 
            customers.id AS "customersId", customers.name AS "customersName",
            games.id AS "gamesId", games.name AS "gamesName", games."categoryId",
            categories.name AS "categoryName"
          FROM rentals
            JOIN customers ON customers.id=rentals."customerId"
            JOIN games ON games.id=rentals."gameId"
            JOIN categories ON categories.id=games."categoryId"
          WHERE rentals."gameId"=$1
        `,
        rowMode: 'array'
      }, [gameId]);

      const rentalsReaderGameId = queryRentalsGameId.rows.map(rental => {
        const [
          id,
          customerId,
          gameId,
          rentDate,
          daysRented,
          returnDate,
          originalPrice,
          delayFee,
          customersId,
          customersName,
          gamesId,
          gamesName,
          categoryId,
          categoryName
        ] = rental;

        return {
          id,
          customerId,
          gameId,
          rentDate: dayjs(rentDate).format('YYYY-MM-DD'),
          daysRented,
          returnDate: returnDate === null ? returnDate : dayjs(returnDate).format('YYYY-MM-DD'),
          originalPrice,
          delayFee,
          customer: {
            id: customersId,
            name: customersName
          },
          game: {
            id: gamesId,
            name: gamesName,
            categoryId,
            categoryName
          }
        }
      });

      res.send(rentalsReaderGameId);
    } else {
      const queryRentals = await connection.query({
        text: `
          SELECT 
            rentals.*, 
            customers.id AS "customersId", customers.name AS "customersName",
            games.id AS "gamesId", games.name AS "gamesName", games."categoryId",
            categories.name AS "categoryName"
          FROM rentals
            JOIN customers ON customers.id=rentals."customerId"
            JOIN games ON games.id=rentals."gameId"
            JOIN categories ON categories.id=games."categoryId"
        `,
        rowMode: 'array'
      });

      const rentalsReader = queryRentals.rows.map(rental => {
        const [
          id,
          customerId,
          gameId,
          rentDate,
          daysRented,
          returnDate,
          originalPrice,
          delayFee,
          customersId,
          customersName,
          gamesId,
          gamesName,
          categoryId,
          categoryName
        ] = rental;

        return {
          id,
          customerId,
          gameId,
          rentDate: dayjs(rentDate).format('YYYY-MM-DD'),
          daysRented,
          returnDate: returnDate === null ? returnDate : dayjs(returnDate).format('YYYY-MM-DD'),
          originalPrice,
          delayFee,
          customer: {
            id: customersId,
            name: customersName
          },
          game: {
            id: gamesId,
            name: gamesName,
            categoryId,
            categoryName
          }
        }
      });

      res.send(rentalsReader);
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

export async function returnRental(req, res) {
  const id = req.params.id;

  try {
    const querySearchedRental = await connection.query(`
      SELECT * FROM rentals 
      WHERE id=$1
    `, [id]);
    const validationRental = (querySearchedRental.rows.length === 0);
    if (validationRental) {
      res.sendStatus(404);
      return;
    } else if (querySearchedRental.rows[0].returnDate !== null) {
      res.sendStatus(400);
      return;
    }

    const querySearchedRentalGames = await connection.query(`
      SELECT * FROM rentals 
      WHERE "customerId"=$1 AND "gameId"=$2
    `, [querySearchedRental.rows[0].customerId, querySearchedRental.rows[0].gameId]);
    if (querySearchedRentalGames.rows.length === 1) {
      if (querySearchedRental.rows[0].returnDate !== null) {
        console.log("entrei");
        res.sendStatus(400);
        return;
      }
    } else {
      const queryQuantityNotDelivered = await connection.query(`
        SELECT * FROM rentals
        WHERE "customerId"=$1 AND "gameId"=$2 AND "returnDate" IS NULL
      `, [querySearchedRental.rows[0].customerId, querySearchedRental.rows[0].gameId]);

      const queryQuantityDelivered = await connection.query(`
        SELECT * FROM rentals
        WHERE "customerId"=$1 AND "gameId"=$2 AND "returnDate" IS NOT NULL
      `, [querySearchedRental.rows[0].customerId, querySearchedRental.rows[0].gameId]);

      if (queryQuantityNotDelivered.rows.length === queryQuantityDelivered.rows.length) {
        res.sendStatus(400);
        return;
      }
    }

    const querySearchedGame = await connection.query(`
      SELECT * FROM games
      WHERE id=$1
    `, [querySearchedRental.rows[0].gameId]);

    const rentDate = dayjs(querySearchedRental.rows[0].rentDate).format('YYYY-MM-DD');
    const daysRented = querySearchedRental.rows[0].daysRented;

    const expectedDate = new Date(dayjs(rentDate).add(daysRented, 'day').format('YYYY-MM-DD'));
    const receivedDate = new Date(dayjs().format('YYYY-MM-DD'));

    let delayFee;
    if (receivedDate < expectedDate) {
      delayFee = 0;
    } else {
      const Difference_In_Time = receivedDate.getTime() - expectedDate.getTime();
      const Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
      const pricePerDay = querySearchedGame.rows[0].pricePerDay;

      delayFee = Difference_In_Days * pricePerDay;
    }

    await connection.query(`
      INSERT INTO rentals 
        ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee")
      VALUES
        ($1, $2, $3, $4, $5, $6, $7)
    `,
      [
        querySearchedRental.rows[0].customerId,
        querySearchedRental.rows[0].gameId,
        dayjs(querySearchedRental.rows[0].rentDate).format('YYYY-MM-DD'),
        querySearchedRental.rows[0].daysRented,
        dayjs().format('YYYY-MM-DD'),
        querySearchedRental.rows[0].originalPrice,
        delayFee
      ]
    );

    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

export async function deleteRental(req, res) {
  const id = req.params.id;

  try {
    const querySearchedRental = await connection.query(`
      SELECT * FROM rentals 
      WHERE id=$1
    `, [id]);
    const validationRental = (querySearchedRental.rows.length === 0);
    if (validationRental) {
      res.sendStatus(404);
      return;
    } else if (querySearchedRental.rows[0].returnDate !== null) {
      res.sendStatus(400);
      return;
    }

    await connection.query(`
      DELETE FROM rentals
      WHERE id=$1
    `, [id]);

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}