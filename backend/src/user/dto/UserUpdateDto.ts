export class UserUpdateDto {
  constructor(private readonly _nickname: string) {}

  get nickname() {
    return this._nickname;
  }
}
