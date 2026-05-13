/* eslint-disable prettier/prettier */
import { TABLES } from '@/constants';
import { Inject, Injectable } from '@nestjs/common';
import { Knex } from 'knex';

@Injectable()
export class NotesService {
  constructor(@Inject('KNEX_CONNECTION') private readonly knex: Knex) {}
  async getUserNotes(
    userId: string,
  ): Promise<any> {
    const notes = await this.knex(TABLES.NOTES)
      .join(TABLES.USERS, 'tbl_notes.user_id', 'tbl_users.id')
      .select(
        'tbl_notes.id',
        'tbl_notes.title',
        'tbl_notes.description',
        'tbl_notes.date',
      )
      .where({ user_id: userId, 'tbl_notes.status': 1 });
    return notes;
  }

  async getUserNotesOfASpecificData(
    userId: string,
    givenDate: string,
  ): Promise<any> {
    const notes = await this.knex(TABLES.NOTES)
      .join(TABLES.USERS, 'tbl_notes.user_id', 'tbl_users.id')
      .select(
        'tbl_notes.id',
        'tbl_notes.title',
        'tbl_notes.description',
        'tbl_notes.date',
      )
      .where({ user_id: userId, 'tbl_notes.status': 1 })
      .andWhereRaw(`tbl_notes.date::date = ?`, [givenDate]);
    return notes;
  }

  async createNewNote(
    userId: string,
    noteTitle: string,
    noteContent: string,
    noteDate: string,
  ): Promise<any> {
    const [note] = await this.knex
      .insert({
        user_id: userId,
        title: noteTitle,
        description: noteContent,
        date: noteDate,
      })
      .into(TABLES.NOTES)
      .returning(['id', 'title', 'description', 'date']);
    return note;
  }

  async updateExistingNote(
    noteId: string,
    userId: string,
    data: any,
  ): Promise<any> {
    const today = new Date().toISOString().split('T')[0];

    const [note] = await this.knex(TABLES.NOTES)
      .update({
        title: data.title,
        description: data.content,
        date: data.date,
        updated_at: this.knex.fn.now(),
      })
      .where({ user_id: userId, id: noteId, status: 1, })
      .andWhereRaw(`tbl_notes.date::date >= ?`, today)
      .returning(['id', 'title', 'description', 'date']);
    return note;
  }

  async isExistingNoteFromPast(
    noteId: string,
    userId: string,
  ): Promise<any> {
    const today = new Date().toISOString().split('T')[0];

    const note = await this.knex.raw(`
    SELECT CASE WHEN EXISTS(
      SELECT date 
      FROM ${TABLES.NOTES} 
        WHERE user_id = ? 
        AND id = ? 
        AND date::date < ?
      ) THEN true ELSE false END AS ExistsCheck;
    `, [userId, noteId, today])
    return note.rows[0].existscheck;
  }

  async deleteExistingNote(
    noteId: string,
    userId: string,
  ): Promise<any> {
    const [note] = await this.knex(TABLES.NOTES)
      .update({
        status: 0,
        deleted_at: this.knex.fn.now(),
      })
      .where({ user_id: userId, id: noteId })
      .returning(['id', 'title', 'description', 'date', 'deleted_at']);
    return note;
  }
}
