export declare namespace Task {
  type Id = string

  interface Entity {
    id: Id
    title: string
    done: boolean
  }

  type Status = 'pending' | 'error' | 'success'
}
