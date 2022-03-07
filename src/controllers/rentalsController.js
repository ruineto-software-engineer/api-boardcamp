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
      WHERE "gameId"=$1 AND "returnDate" IS NULL
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
  const status = req.query.status;
  const startDate = req.query.startDate;

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
      customerId: 2,
      gameId: 3,
      rentDate: 4,
      daysRented: 5,
      returnDate: 6,
      originalPrice: 7,
      delayFee: 8
    }
    let orderBy = 'ORDER BY rentals.id';
    if (req.query.order && orderByFilter[req.query.order] && req.query.desc === undefined) {
      orderBy = `ORDER BY ${orderByFilter[req.query.order]}`;
    } else if (req.query.order && orderByFilter[req.query.order] && req.query.desc) {
      orderBy = `ORDER BY ${orderByFilter[req.query.order]} DESC`;
    }

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
          ${orderBy}
            ${offset}
            ${limit}
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
          ${orderBy}
            ${offset}
            ${limit}
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
    } else if (status !== undefined) {
      if (status === "open") {
        const queryRentalsOpenStatus = await connection.query({
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
            WHERE rentals."returnDate" IS NULL
          `,
          rowMode: 'array'
        });

        const rentalsReader = queryRentalsOpenStatus.rows.map(rental => {
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
      } else if (status === "close") {
        const queryRentalsCloseStatus = await connection.query({
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
            WHERE rentals."returnDate" IS NOT NULL
          `,
          rowMode: 'array'
        });

        const rentalsReader = queryRentalsCloseStatus.rows.map(rental => {
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
    } else if (startDate !== undefined) {
      const queryRentalsStartDate = await connection.query({
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
          WHERE rentals."rentDate">$1 OR rentals."rentDate"=$1
        `,
        rowMode: 'array'
      }, [startDate]);

      const rentalsReader = queryRentalsStartDate.rows.map(rental => {
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
          ${orderBy}
            ${offset}
            ${limit}
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
      WHERE "customerId"=$1 AND "gameId"=$2 AND id=$3
    `,
      [
        querySearchedRental.rows[0].customerId,
        querySearchedRental.rows[0].gameId,
        id
      ]);
    if (querySearchedRentalGames.rows[0].returnDate !== null) {
      res.sendStatus(400);
      return;
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

    const rent = await connection.query(`
      UPDATE rentals SET
        "customerId"=$1,
        "gameId"=$2,
        "rentDate"=$3,
        "daysRented"=$4,
        "returnDate"=$5,
        "originalPrice"=$6,
        "delayFee"=$7
      WHERE
        id=$8
    `,
      [
        querySearchedRental.rows[0].customerId,
        querySearchedRental.rows[0].gameId,
        dayjs(querySearchedRental.rows[0].rentDate).format('YYYY-MM-DD'),
        querySearchedRental.rows[0].daysRented,
        dayjs().format('YYYY-MM-DD'),
        querySearchedRental.rows[0].originalPrice,
        delayFee,
        querySearchedRental.rows[0].id
      ]
    );

    res.sendStatus(200);
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

export async function metricsRentals(req, res) {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  let queryDateConstructor = '';
  if (startDate === undefined && endDate === undefined) {
    queryDateConstructor = ""
  } else if (startDate && endDate === undefined) {
    queryDateConstructor = `WHERE "rentDate" >= CAST('${startDate}' AS DATE)`;
  } else if (startDate === undefined && endDate) {
    queryDateConstructor = `WHERE "rentDate" <= CAST('${endDate}' AS DATE)`;
  } else {
    queryDateConstructor = `WHERE "rentDate" BETWEEN CAST('${startDate}' AS DATE) AND CAST('${endDate}' AS DATE)`;
  }

  try {
    const queryMetricsRentals = await connection.query(`
      SELECT
        SUM("originalPrice" + "delayFee") revenue,
        COUNT(id) rentals
      FROM rentals
      ${queryDateConstructor}
    `);

    const revenue = parseInt(queryMetricsRentals.rows[0].revenue);
    const rentals = parseInt(queryMetricsRentals.rows[0].rentals);
    const average = parseInt(revenue / rentals);

    const metrics = {
      revenue,
      rentals,
      average
    }

    res.send(metrics);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}