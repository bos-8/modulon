// @file: server/src/modules/admin/user/user.exceptions.ts

import { HttpException, HttpStatus } from '@nestjs/common'

export class UserNotFoundException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Użytkownik nie istnieje.',
        error: 'UserNotFound',
      },
      HttpStatus.NOT_FOUND,
    )
  }
}

export class UserForbiddenUpdateException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Nie masz uprawnień do edycji tego użytkownika.',
        error: 'UserForbiddenUpdate',
      },
      HttpStatus.FORBIDDEN,
    )
  }
}

export class UserInvalidRoleChangeException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Nie można przypisać roli wyższej niż twoja.',
        error: 'InvalidRoleChange',
      },
      HttpStatus.BAD_REQUEST,
    )
  }
}

export class SelfModificationForbiddenException extends HttpException {
  constructor(action: 'role-change' | 'delete' | 'block') {
    const messages = {
      'role-change': 'Nie możesz zmieniać swojej własnej roli.',
      'delete': 'Nie możesz usunąć samego siebie.',
      'block': 'Nie możesz zablokować samego siebie.',
    }

    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        message: messages[action],
        error: 'SelfModificationForbidden',
      },
      HttpStatus.FORBIDDEN,
    )
  }
}
//EOF