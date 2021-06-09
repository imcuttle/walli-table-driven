/**
 * @file main
 * @author imcuttle
 * @date 2018/4/4
 */
import { walliTableDrivenQuery } from '../src'

describe('walliTableDriven', function () {
  it('should spec', function () {
    expect(
      walliTableDrivenQuery(
        {
          age: 20
        },
        [[{ age: 2 }, null]]
      )
    ).toMatchSnapshot()

    expect(
      walliTableDrivenQuery(
        {
          age: 20
        },
        [
          [{ age: 2 }, null],
          [{ age: 20 }, null]
        ]
      )
    ).toMatchSnapshot()

    expect(
      walliTableDrivenQuery(
        {
          age: 20
        },
        {
          where: { age: 20 }
        }
      )
    ).toMatchSnapshot()
  })
})
