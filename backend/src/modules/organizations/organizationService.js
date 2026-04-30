export async function getOrganizations(db) {
    const result = await db.query('SELECT id, name, markup, city, region, country, tin, zipcode FROM organizations');
    return result.rows;
}
export async function getOrganizationById(db, id) {
    const result = await db.query('SELECT id,   name, markup, city, region, country, tin, zipcode FROM organizations WHERE id = $1', [id]);
    return result.rows[0];
}
export async function createOrganization(db, organization) {
    const insertQuery = `
      INSERT INTO organizations
        (name, markup, fname, lname, email, contact, city, region, country, tin, zipcode)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      organization.name,
      organization.markup,
      organization.fname,
      organization.lname,
      organization.email,
      organization.contact,
      organization.city,
      organization.region,
      organization.country,
      organization.tin,
      organization.zipcode,
    ];

    try {
      const result = await db.query(insertQuery, values);
      return result.rows[0];
    } catch (error) {
      
      if (error.code === '23505' && error.constraint === 'organizations_pkey') {
        await db.query(`
          SELECT setval(
            pg_get_serial_sequence('organizations', 'id'),
            COALESCE((SELECT MAX(id) FROM organizations), 1),
            true
          )
        `);
        const retryResult = await db.query(insertQuery, values);
        return retryResult.rows[0];
      }
      throw error;
    }
}
export async function updateOrganization(db, id, organization) {
    const result = await db.query('UPDATE organizations SET name = $1, markup = $2, city = $3, region = $4, country = $5, tin = $6, zipcode = $7 WHERE id = $8 RETURNING *', [organization.name, organization.markup, organization.city, organization.region, organization.country, organization.tin, organization.zipcode, id]);
    return result.rows[0];
}