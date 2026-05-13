import { Knex } from "knex";
import { hashPassword } from "../../utils/bcrypt.utils";
import { TABLES, PROVIDER_TYPES } from "../../constants/database.constants";

export async function seed(knex: Knex): Promise<void> {
    await knex(TABLES.PROVIDERS).del();
    await knex(TABLES.USERS).del();

    const hashedPassword = await hashPassword("Test123@");
    
    const [user] = await knex(TABLES.USERS).insert({
        name: "Ghulam Rasool",
        password: hashedPassword,
    }).returning(['id']);

    await knex(TABLES.PROVIDERS).insert({
        user_id: user.id,
        provider_type: PROVIDER_TYPES.EMAIL,
        provider_value: "ghulam.rasool@example.com",
    });
};
