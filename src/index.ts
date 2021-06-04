/**
 * The table driven engine which respect walli
 * @author imcuttle
 */
import { Verifiable, leq } from 'walli'

export type WhereRule<T = any> =
  | {
      [P in keyof T]?: T[P] | Verifiable
    }
  | Verifiable

export type TableRuleResult<T, R> = R | ((source: T, check: (rule: WhereRule<T>) => boolean) => R)
export interface TableRuleOptions {
  shouldContinue?: boolean
}

export interface StrictTableRule<T = any, R = any> {
  where: WhereRule<T>
  result: TableRuleResult<T, R>
  options?: TableRuleOptions
}

export type TableRule<T = any, R = any> =
  | StrictTableRule<T, R>
  | [WhereRule<T>, TableRuleResult<T, R>, TableRuleOptions?]

export function toStrictTableRule(rule): StrictTableRule {
  if (Array.isArray(rule)) {
    return {
      where: rule[0],
      result: rule[1],
      options: rule[2]
    }
  }
  return rule
}

export function toVerifiable(rule: any) {
  let verifiable: Verifiable
  if (rule instanceof Verifiable) {
    verifiable = rule
  } else {
    verifiable = leq(rule)
  }
  return verifiable
}

export function walliTableDrivenQuery<T = any, R = any>(
  value: T,
  tableRule: StrictTableRule<T, R> | TableRule<T, R>[]
) {
  if (Array.isArray(tableRule)) {
    const matchedList: any[] = []
    tableRule.some((rule) => {
      const strictRule = toStrictTableRule(rule)
      const { shouldContinue = false } = strictRule.options || {}
      const currentMatched = walliTableDrivenQuery(value, strictRule)
      if (currentMatched.matched) {
        matchedList.push(currentMatched)
        // 需要 merge，并且已经匹配过
        if (shouldContinue) {
          return false
        }
      }
      return currentMatched.matched
    })

    // tslint:disable-next-line:no-shadowed-variable
    const mergedResult = matchedList.reduce((acc, matched: any) => {
      if (!acc) {
        return matched.result
      }
      return {
        ...acc,
        ...matched.result
      }
    }, null)

    const res = {
      matched: !!matchedList.length,
      result: mergedResult as R
    }
    if (res.matched) {
      // @ts-ignore
      res.rule = matchedList
    }
    return res
  }

  const strictTableRule = toStrictTableRule(tableRule)
  const verifiable = toVerifiable(strictTableRule.where)

  if (verifiable.ok(value)) {
    let result = strictTableRule.result
    if (typeof strictTableRule.result === 'function') {
      const check = (where: WhereRule) => {
        return toVerifiable(where).ok(value)
      }
      result = strictTableRule.result(value, check)
    }
    return { result, rule: strictTableRule, matched: true }
  }
  return { result: null, matched: false }
}
