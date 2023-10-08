export class UserUpdateDto {
  constructor(
    private readonly _nickname: string,
    private readonly _username: string
  ) {}

  get nickname() {
    return this._nickname;
  }

  get username() {
    return this._username;
  }
}
