"use client";

import { Crown, Network, RotateCcw, ShieldCheck } from "lucide-react";
import { useToast } from "@/features/accounting/shared";
import { HrPage, PersonCell, useHrUi, useScopedEmployees } from "@/features/hr/shared";
import { canAccessModule, ROLE_IDS } from "@/lib/config/roles";
import { EMPLOYEES, PERMISSION_MODULES, type Employee } from "@/lib/mock/hr-data";
import { Avatar, Badge, Bubble, Card, CardHead, IconButton, Notice, Select, Switch } from "@/ui";
import type { ModuleId, RoleId } from "@/types";

export function StructureScreen() {
  const { app, hr, tx, num, nameOf, jobOf, branchOf, copy } = useHrUi();
  const s = copy.structure;
  const employees = useScopedEmployees();
  const { show, toast } = useToast();
  const roleLabels = app.t.roles as Record<RoleId, string>;
  const moduleLabels = app.t.modules as unknown as Record<string, string>;

  const roleOf = (employee: Employee): RoleId => hr.roleOverrides[employee.id] ?? employee.role;
  const effective = (employee: Employee, module: ModuleId): boolean => {
    const override = hr.moduleOverrides[employee.id]?.[module];
    return override ?? canAccessModule(roleOf(employee), module);
  };
  const isCustom = (employee: Employee) => Object.keys(hr.moduleOverrides[employee.id] ?? {}).length > 0;

  const managers = employees.filter((employee) => !employee.managerId || !employees.some((entry) => entry.id === employee.managerId));
  const reports = (id: string) => EMPLOYEES.filter((employee) => employee.managerId === id && employees.some((entry) => entry.id === employee.id));

  const renderNode = (employee: Employee, depth: number): React.ReactNode => (
    <div key={employee.id} className="stack" style={{ gap: 8, paddingInlineStart: depth ? 22 : 0 }}>
      <div className="pill-row" style={{ background: depth ? "var(--card-soft)" : "var(--card)" }}>
        <Avatar name={nameOf(employee)} />
        <div className="grow">
          <b style={{ fontWeight: 550 }}>{nameOf(employee)}</b>
          <div className="t-small t-muted">
            {jobOf(employee)} · {roleLabels[roleOf(employee)]}
          </div>
        </div>
        {reports(employee.id).length ? (
          <Badge tone="outline" plain>
            {num(reports(employee.id).length)} {tx(s.directReports)}
          </Badge>
        ) : null}
      </div>
      {reports(employee.id).map((child) => renderNode(child, depth + 1))}
    </div>
  );

  return (
    <HrPage title={s.title} subtitle={s.subtitle}>
      <div className="bento">
        <Card className="span-5">
          <CardHead title={tx(s.chart)} />
          <div className="pill-row" style={{ background: "var(--lime)", color: "var(--on-lime)" }}>
            <Bubble tone="glass">
              <Crown />
            </Bubble>
            <div className="grow">
              <b style={{ fontWeight: 550 }}>{roleLabels.owner}</b>
              <div className="t-small" style={{ opacity: 0.7 }}>
                {tx(s.group)}
              </div>
            </div>
          </div>
          <div className="stack" style={{ gap: 14, paddingInlineStart: 14, borderInlineStart: "2px solid var(--line-strong)" }}>
            {managers.map((employee) => (
              <div key={employee.id} className="stack" style={{ gap: 6 }}>
                <span className="t-small t-muted">{branchOf(employee)}</span>
                {renderNode(employee, 0)}
              </div>
            ))}
          </div>
        </Card>

        <Card className="span-7">
          <CardHead title={tx(s.role)} actions={<Bubble><ShieldCheck /></Bubble>} />
          <div className="table-wrap">
            <table className="table table--compact">
              <thead>
                <tr>
                  <th>{tx(copy.common.employee)}</th>
                  <th>{tx(s.role)}</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <PersonCell employee={employee} />
                    </td>
                    <td data-label={tx(s.role)}>
                      <div className="row">
                        <Select
                          className="select--sm"
                          style={{ width: "auto" }}
                          aria-label={tx(s.role)}
                          value={roleOf(employee)}
                          onChange={(event) => {
                            hr.setRole(employee.id, event.target.value as RoleId);
                            show(tx(s.updated));
                          }}
                        >
                          {ROLE_IDS.map((role) => (
                            <option key={role} value={role}>
                              {roleLabels[role]}
                            </option>
                          ))}
                        </Select>
                        {isCustom(employee) ? (
                          <>
                            <Badge tone="lilac">{tx(s.custom)}</Badge>
                            <IconButton label={tx(s.resetRole)} size="sm" variant="soft" onClick={() => hr.setRole(employee.id, roleOf(employee))}>
                              <RotateCcw />
                            </IconButton>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="span-12">
          <CardHead title={tx(s.matrix)} hint={tx(s.permissionNote)} actions={<Bubble><Network /></Bubble>} />
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>{tx(copy.common.employee)}</th>
                  {PERMISSION_MODULES.map((module) => (
                    <th key={module} style={{ textAlign: "center", fontSize: 11 }}>
                      {moduleLabels[module]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <PersonCell employee={employee} />
                    </td>
                    {PERMISSION_MODULES.map((module) => {
                      const base = canAccessModule(roleOf(employee), module);
                      const allowed = effective(employee, module);
                      return (
                        <td key={module} data-label={moduleLabels[module]} style={{ textAlign: "center" }}>
                          <Switch
                            checked={allowed}
                            label={`${nameOf(employee)} — ${moduleLabels[module]}`}
                            onChange={(next) => {
                              hr.setModuleAccess(employee.id, module, next === base ? null : next);
                              show(tx(s.updated));
                            }}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Notice icon={<ShieldCheck />}>{tx(s.permissionNote)}</Notice>
        </Card>
      </div>
      {toast}
    </HrPage>
  );
}
