import { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { SimpleSelect, SimpleSelectItem } from "@/components/ui/simple-select";
import { formatCurrency } from "@/utils/formatters";
import { getDespesas, getMovimentos, getSetoristas, getInvestimentos, getComissoesRetidas } from "@/services/storageService";
import { Despesa, MovimentoFinanceiro, Setorista, Investimento, ComissaoRetida } from "@/types/models";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  Loader2,
  RefreshCcw,
  Sparkles,
  TrendingUp,
  Printer,
} from "lucide-react";

type IndicatorKey = "vendas" | "comissao" | "premios" | "despesas" | "investimentos" | "comissaoRetida" | "liquido";

type MonthPerformance = Record<
  IndicatorKey,
  number
>;

type MonthOption = {
  value: string;
  label: string;
};

const indicatorConfig: Record<
  IndicatorKey,
  { label: string; description: string; accent?: string }
> = {
  vendas: {
    label: "Vendas",
    description: "Receita bruta gerada no período",
  },
  comissao: {
    label: "Comissão",
    description: "Comissões pagas",
    accent: "text-red-600",
  },
  premios: {
    label: "Prêmios",
    description: "Prêmios distribuídos",
    accent: "text-red-600",
  },
  despesas: {
    label: "Despesas",
    description: "Despesas operacionais registradas",
    accent: "text-red-600",
  },
  investimentos: {
    label: "Investimentos",
    description: "Investimentos realizados no período",
    accent: "text-red-600",
  },
  comissaoRetida: {
    label: "Comissão Retida",
    description: "Comissões retidas",
    accent: "text-red-600",
  },
  liquido: {
    label: "Líquido",
    description: "Resultado final (vendas - custos)",
    accent: "text-primary",
  },
};

const createMonthOptions = (total = 12): MonthOption[] => {
  const items: MonthOption[] = [];
  const now = new Date();

  for (let i = 0; i < total; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    items.push({
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`,
      label: date.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      }),
    });
  }

  return items;
};

const getDefaultMonths = (): string[] => {
  const options = createMonthOptions(3);
  const defaults = options.slice(0, 2).map((item) => item.value);
  return defaults.reverse();
};

const formatMonthLabel = (
  value: string,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    year: "numeric",
  }
) => {
  const [year, month] = value.split("-").map(Number);
  const date = new Date(year, (month || 1) - 1, 1);
  return date.toLocaleDateString("pt-BR", options);
};

const monthKeyFromDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const calculatePercentage = (diff: number, base: number) => {
  if (base === 0) return null;
  return (diff / base) * 100;
};

const getTrendInfo = (diff: number) => {
  const threshold = 1; // R$ 1 de tolerância

  if (diff > threshold) {
    return { icon: "🔼", color: "text-green-600", label: "Aumentou" };
  }

  if (diff < -threshold) {
    return { icon: "🔽", color: "text-red-600", label: "Caiu" };
  }

  return { icon: "➖", color: "text-yellow-600", label: "Estável" };
};

const emptyPerformance = (): MonthPerformance => ({
  vendas: 0,
  comissao: 0,
  premios: 0,
  despesas: 0,
  investimentos: 0,
  comissaoRetida: 0,
  liquido: 0,
});

const PerformanceAnalysisPage = () => {
  const [setoristas, setSetoristas] = useState<Setorista[]>([]);
  const [movimentos, setMovimentos] = useState<MovimentoFinanceiro[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [investimentos, setInvestimentos] = useState<Investimento[]>([]);
  const [comissoesRetidas, setComissoesRetidas] = useState<ComissaoRetida[]>([]);
  const [selectedSetorista, setSelectedSetorista] = useState<string>("all");
  const [selectedMonths, setSelectedMonths] = useState<string[]>(() =>
    getDefaultMonths()
  );
  const [monthPopoverOpen, setMonthPopoverOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const monthOptions = useMemo(() => createMonthOptions(18), []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [setoristasData, movimentosData, despesasData, investimentosData, comissoesRetidasData] = await Promise.all([
          getSetoristas(),
          getMovimentos(),
          getDespesas(),
          getInvestimentos(),
          getComissoesRetidas(),
        ]);
        setSetoristas(setoristasData);
        setMovimentos(movimentosData);
        setDespesas(despesasData);
        setInvestimentos(investimentosData);
        setComissoesRetidas(comissoesRetidasData);
      } catch (error) {
        console.error("Erro ao carregar dados de performance:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const [movimentosAtualizados, despesasAtualizadas, investimentosAtualizados, comissoesRetidasAtualizadas] = await Promise.all([
        getMovimentos(),
        getDespesas(),
        getInvestimentos(),
        getComissoesRetidas(),
      ]);
      setMovimentos(movimentosAtualizados);
      setDespesas(despesasAtualizadas);
      setInvestimentos(investimentosAtualizados);
      setComissoesRetidas(comissoesRetidasAtualizadas);
    } catch (error) {
      console.error("Erro ao atualizar dados:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePrint = () => {
    if (!sortedMonths.length) return;

    const comparativeTableRows = (Object.keys(indicatorConfig) as IndicatorKey[])
      .map((key) => {
        const cells = sortedMonths
          .map(
            (month) => `
              <td class="text-right">
                ${formatCurrency(monthlyPerformance[month]?.[key] ?? 0)}
              </td>`
          )
          .join("");

        return `
          <tr>
            <td>
              <strong>${indicatorConfig[key].label}</strong>
            </td>
            ${cells}
          </tr>
        `;
      })
      .join("");

    const comparativeTableHeaders = sortedMonths
      .map(
        (month) => `
          <th class="text-right">
            ${formatMonthLabel(month, { month: "short", year: "2-digit" })}
          </th>`
      )
      .join("");

    const variationRows = variationSummary.length
      ? variationSummary
          .map((row) => {
            const percentText =
              row.percent === null
                ? "—"
                : `${row.percent > 0 ? "+" : ""}${row.percent.toFixed(1)}%`;
            const trendColor =
              row.trend.icon === "🔼"
                ? "#15803d"
                : row.trend.icon === "🔽"
                  ? "#b91c1c"
                  : "#ca8a04";

            return `
              <tr>
                <td><strong>${row.label}</strong></td>
                <td>${row.range}</td>
                <td class="${row.diff > 0 ? "text-up" : row.diff < 0 ? "text-down" : ""} text-right">
                  ${row.diff > 0 ? "+" : ""}${formatCurrency(row.diff)}
                </td>
                <td class="text-right">${percentText}</td>
                <td style="color:${trendColor};">${row.trend.icon} ${row.trend.label}</td>
              </tr>
            `;
          })
          .join("")
      : `
        <tr>
          <td colspan="5" class="text-center">Selecione ao menos dois meses para comparar.</td>
        </tr>
      `;

    const monthsSummary = sortedMonths
      .map((month) =>
        formatMonthLabel(month, { month: "long", year: "numeric" })
      )
      .join(" • ");

    const styles = `
      @page {
        margin: 1.5cm;
        size: A4;
      }
      body {
        font-family: 'Segoe UI', Arial, sans-serif;
        padding: 20px;
        color: #0f172a;
        background: #fff;
        font-size: 12px;
      }
      header {
        margin-bottom: 14px;
      }
      h1 {
        font-size: 22px;
        margin: 0 0 8px 0;
        font-weight: bold;
      }
      h2 {
        font-size: 16px;
        margin: 14px 0 10px 0;
        font-weight: bold;
      }
      p {
        margin: 4px 0;
        font-size: 11px;
        line-height: 1.5;
      }
      section {
        margin-bottom: 14px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 14px;
        font-size: 11px;
      }
      th, td {
        border: 1px solid #e2e8f0;
        padding: 7px 10px;
        font-size: 11px;
        vertical-align: middle;
        line-height: 1.5;
      }
      th {
        background: #f8fafc;
        font-weight: bold;
      }
      .text-right { text-align: right; }
      .text-center { text-align: center; }
      .text-up { color: #15803d; font-weight: 600; }
      .text-down { color: #b91c1c; font-weight: 600; }
      .summary-box {
        border: 1px solid #e2e8f0;
        padding: 12px;
        margin-top: 12px;
        font-size: 11px;
      }
      small {
        color: #475569;
        font-size: 10px;
      }
      strong {
        font-weight: bold;
      }
    `;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Análise de Performance</title>
          <style>${styles}</style>
        </head>
        <body>
          <header>
            <h1>Análise de Performance</h1>
            <p><strong>Setorista:</strong> ${selectedSetoristaLabel} | <strong>Período:</strong> ${monthsSummary} | <small>${new Date().toLocaleString("pt-BR")}</small></p>
          </header>

          <section>
            <h2>Tabela Comparativa de Performance</h2>
            <table>
              <thead>
                <tr>
                  <th>Indicador</th>
                  ${comparativeTableHeaders}
                </tr>
              </thead>
              <tbody>
                ${comparativeTableRows}
              </tbody>
            </table>
          </section>

          <section>
            <h2>Tabela de Variação</h2>
            <table>
              <thead>
                <tr>
                  <th>Indicador</th>
                  <th>Período</th>
                  <th class="text-right">Dif. Valor</th>
                  <th class="text-right">Dif. %</th>
                  <th>Tendência</th>
                </tr>
              </thead>
              <tbody>
                ${variationRows}
              </tbody>
            </table>
          </section>

          <section class="summary-box">
            <h2>Texto Automático de Análise</h2>
            <p>${analysisText}</p>
          </section>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const sortedMonths = useMemo(() => {
    if (!selectedMonths.length) return [];
    return [...selectedMonths].sort((a, b) => {
      const dateA = new Date(`${a}-01`).getTime();
      const dateB = new Date(`${b}-01`).getTime();
      return dateA - dateB;
    });
  }, [selectedMonths]);

  const filteredMovimentos = useMemo(() => {
    return movimentos.filter((movimento) => {
      const matchesSetorista =
        selectedSetorista === "all" ||
        movimento.setoristaId === selectedSetorista;
      const monthKey = monthKeyFromDate(movimento.data);
      const matchesMonth =
        !sortedMonths.length || sortedMonths.includes(monthKey);
      return matchesSetorista && matchesMonth;
    });
  }, [movimentos, selectedSetorista, sortedMonths]);

  const filteredDespesas = useMemo(() => {
    return despesas.filter((despesa) => {
      const matchesSetorista =
        selectedSetorista === "all" ||
        despesa.setoristaId === selectedSetorista;
      const monthKey = monthKeyFromDate(despesa.data);
      const matchesMonth =
        !sortedMonths.length || sortedMonths.includes(monthKey);
      return matchesSetorista && matchesMonth;
    });
  }, [despesas, selectedSetorista, sortedMonths]);

  const filteredInvestimentos = useMemo(() => {
    return investimentos.filter((investimento) => {
      const matchesSetorista =
        selectedSetorista === "all" ||
        investimento.setoristaId === selectedSetorista;
      const monthKey = monthKeyFromDate(investimento.data);
      const matchesMonth =
        !sortedMonths.length || sortedMonths.includes(monthKey);
      return matchesSetorista && matchesMonth;
    });
  }, [investimentos, selectedSetorista, sortedMonths]);

  const filteredComissoesRetidas = useMemo(() => {
    return comissoesRetidas.filter((comissaoRetida) => {
      const matchesSetorista =
        selectedSetorista === "all" ||
        comissaoRetida.setoristaId === selectedSetorista;
      const monthKey = monthKeyFromDate(comissaoRetida.data);
      const matchesMonth =
        !sortedMonths.length || sortedMonths.includes(monthKey);
      return matchesSetorista && matchesMonth;
    });
  }, [comissoesRetidas, selectedSetorista, sortedMonths]);

  const monthlyPerformance = useMemo(() => {
    const base: Record<string, MonthPerformance> = {};

    sortedMonths.forEach((month) => {
      base[month] = emptyPerformance();
    });

    filteredMovimentos.forEach((movimento) => {
      const monthKey = monthKeyFromDate(movimento.data);
      const perf = base[monthKey];
      if (!perf) return;

      perf.vendas += movimento.vendas || 0;
      perf.comissao += movimento.comissao || 0;
      perf.premios += movimento.premios || 0;
    });

    filteredDespesas.forEach((despesa) => {
      const monthKey = monthKeyFromDate(despesa.data);
      const perf = base[monthKey];
      if (!perf) return;

      perf.despesas += despesa.valor || 0;
    });

    filteredInvestimentos.forEach((investimento) => {
      const monthKey = monthKeyFromDate(investimento.data);
      const perf = base[monthKey];
      if (!perf) return;

      perf.investimentos += investimento.valor || 0;
    });

    filteredComissoesRetidas.forEach((comissaoRetida) => {
      const monthKey = monthKeyFromDate(comissaoRetida.data);
      const perf = base[monthKey];
      if (!perf) return;

      perf.comissaoRetida += comissaoRetida.valor || 0;
    });

    sortedMonths.forEach((month) => {
      const perf = base[month];
      perf.liquido = perf.vendas - perf.comissao - perf.premios - perf.despesas - perf.investimentos - perf.comissaoRetida;
    });

    return base;
  }, [filteredMovimentos, filteredDespesas, filteredInvestimentos, filteredComissoesRetidas, sortedMonths]);

  const variationSummary = useMemo(() => {
    if (sortedMonths.length < 2) return [];

    const firstMonth = sortedMonths[0];
    const lastMonth = sortedMonths[sortedMonths.length - 1];

    return (Object.keys(indicatorConfig) as IndicatorKey[]).map((key) => {
      const firstValue = monthlyPerformance[firstMonth]?.[key] ?? 0;
      const lastValue = monthlyPerformance[lastMonth]?.[key] ?? 0;
      const diff = lastValue - firstValue;
      const percent = calculatePercentage(diff, firstValue);
      const trend = getTrendInfo(diff);

      return {
        key,
        label: indicatorConfig[key].label,
        range: `${formatMonthLabel(firstMonth)} → ${formatMonthLabel(
          lastMonth
        )}`,
        diff,
        percent,
        trend,
        monthFrom: firstMonth,
        monthTo: lastMonth,
        lastValue,
      };
    });
  }, [monthlyPerformance, sortedMonths]);

  const highlights = useMemo(() => {
    if (!sortedMonths.length) return null;

    const entries = sortedMonths.map((month) => ({
      month,
      label: formatMonthLabel(month, { month: "long", year: "numeric" }),
      liquido: monthlyPerformance[month]?.liquido ?? 0,
    }));

    const bestMonth = entries.reduce(
      (best, current) =>
        !best || current.liquido > best.liquido ? current : best,
      null as (typeof entries)[number] | null
    );

    const worstMonth = entries.reduce(
      (worst, current) =>
        !worst || current.liquido < worst.liquido ? current : worst,
      null as (typeof entries)[number] | null
    );

    const transitions = entries.slice(0, -1).map((entry, index) => {
      const next = entries[index + 1];
      return {
        from: entry,
        to: next,
        diff: (next?.liquido ?? 0) - (entry?.liquido ?? 0),
      };
    });

    const biggestGrowth = transitions.reduce(
      (best, current) =>
        !best || current.diff > best.diff ? current : best,
      null as (typeof transitions)[number] | null
    );

    const biggestDrop = transitions.reduce(
      (worst, current) =>
        !worst || current.diff < worst.diff ? current : worst,
      null as (typeof transitions)[number] | null
    );

    const overallDiff =
      entries[entries.length - 1].liquido - entries[0].liquido || 0;
    const overallTrend = getTrendInfo(overallDiff);

    return {
      bestMonth,
      worstMonth,
      biggestGrowth,
      biggestDrop,
      overallTrend,
    };
  }, [monthlyPerformance, sortedMonths]);

  const selectedSetoristaLabel =
    selectedSetorista === "all"
      ? "o portfólio completo"
      : setoristas.find((item) => item.id === selectedSetorista)?.nome ||
        "o setorista";

  const analysisText = useMemo(() => {
    if (sortedMonths.length < 2 || !variationSummary.length) {
      return "Selecione pelo menos dois meses para gerar uma análise automática.";
    }

    const inicio = formatMonthLabel(sortedMonths[0], {
      month: "long",
      year: "numeric",
    });
    const fim = formatMonthLabel(sortedMonths[sortedMonths.length - 1], {
      month: "long",
      year: "numeric",
    });

    const vendasVariation = variationSummary.find(
      (item) => item.key === "vendas"
    );
    const liquidoVariation = variationSummary.find(
      (item) => item.key === "liquido"
    );

    const describeVariation = (
      variation: (typeof variationSummary)[number] | undefined,
      indicador: string
    ) => {
      if (!variation || variation.percent === null) {
        if (!variation) return `${indicador} se manteve constante`;
        return `${indicador} permaneceu estável`;
      }

      if (variation.diff > 0) {
        return `${indicador} avançou ${variation.percent.toFixed(
          1
        )}% (${formatCurrency(variation.diff)})`;
      }

      if (variation.diff < 0) {
        return `${indicador} recuou ${Math.abs(variation.percent).toFixed(
          1
        )}% (${formatCurrency(variation.diff)})`;
      }

      return `${indicador} ficou estável`;
    };

    const resumoVendas = describeVariation(vendasVariation, "as vendas");
    const resumoLiquido = describeVariation(liquidoVariation, "o líquido");
    const tendencia =
      highlights?.overallTrend.icon === "🔼"
        ? "indicando melhora do desempenho geral"
        : highlights?.overallTrend.icon === "🔽"
          ? "reforçando tendência de queda"
          : "mostrando estabilidade no desempenho";

    return `Entre ${inicio} e ${fim}, ${selectedSetoristaLabel} apresentou ${resumoVendas} e ${resumoLiquido}, ${tendencia}.`;
  }, [highlights, selectedSetoristaLabel, sortedMonths, variationSummary]);

  const handleToggleMonth = (value: string) => {
    setSelectedMonths((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      }
      return [...prev, value];
    });
  };

  const handleSelectRange = (values: string[]) => {
    setSelectedMonths(values);
    setMonthPopoverOpen(false);
  };

  return (
    <div className="space-y-6" ref={printRef}>
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Sorte ParaTodos Financeiro
          </p>
          <h1 className="text-3xl font-bold">Análise de Performance</h1>
          <p className="text-muted-foreground">
            Compare indicadores mês a mês e acompanhe a tendência dos resultados.
          </p>
        </div>
        <div className="flex flex-wrap gap-2" data-print-hide="true">
          <Button
            size="sm"
            className="gap-2"
            onClick={handlePrint}
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            Atualizar dados
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Setorista
              </p>
              <SimpleSelect
                value={selectedSetorista}
                onValueChange={(value) => setSelectedSetorista(value)}
                placeholder="Selecione um setorista"
                className="w-full"
              >
                <SimpleSelectItem value="all">Todos os setoristas</SimpleSelectItem>
                {setoristas.map((setorista) => (
                  <SimpleSelectItem key={setorista.id} value={setorista.id}>
                    {setorista.nome}
                  </SimpleSelectItem>
                ))}
              </SimpleSelect>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Período (um ou múltiplos meses)
              </p>
              <Popover open={monthPopoverOpen} onOpenChange={setMonthPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "w-full justify-between",
                      selectedMonths.length === 0 && "text-muted-foreground"
                    )}
                  >
                    <span>
                      {selectedMonths.length > 0
                        ? `${selectedMonths.length} ${selectedMonths.length === 1 ? "mês selecionado" : "meses selecionados"
                        }`
                        : "Selecione meses"}
                    </span>
                    <CalendarIcon className="ml-2 h-4 w-4 opacity-70" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[320px] space-y-3" align="start">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Meses disponíveis</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectRange(getDefaultMonths())}
                    >
                      Últimos 2
                    </Button>
                  </div>
                  <div className="max-h-64 space-y-1 overflow-auto pr-1">
                    {monthOptions.map((option) => (
                      <label
                        key={option.value}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted"
                      >
                        <Checkbox
                          checked={selectedMonths.includes(option.value)}
                          onCheckedChange={() => handleToggleMonth(option.value)}
                        />
                        <span className="capitalize">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectRange([])}
                    >
                      Limpar
                    </Button>
                    <Button size="sm" onClick={() => setMonthPopoverOpen(false)}>
                      Concluir
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {selectedMonths.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {sortedMonths.map((month) => (
                <Badge key={month} variant="secondary" className="capitalize">
                  {formatMonthLabel(month, { month: "long", year: "numeric" })}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center rounded-lg border border-dashed py-16">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
            Carregando informações de performance...
          </div>
        </div>
      ) : sortedMonths.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          Selecione pelo menos um mês para visualizar a análise.
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Tabela Comparativa de Performance</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Cada linha representa um indicador e cada coluna, um mês selecionado.
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1 text-green-600">
                  🔼 aumento
                </span>
                <span className="flex items-center gap-1 text-yellow-600">
                  ➖ estável
                </span>
                <span className="flex items-center gap-1 text-red-600">
                  🔽 queda
                </span>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Indicador</TableHead>
                    {sortedMonths.map((month) => (
                      <TableHead key={month} className="text-right capitalize">
                        {formatMonthLabel(month, {
                          month: "long",
                          year: "numeric",
                        })}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(Object.keys(indicatorConfig) as IndicatorKey[]).map(
                    (key) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium">
                          {indicatorConfig[key].label}
                        </TableCell>
                        {sortedMonths.map((month) => (
                          <TableCell
                            key={`${key}-${month}`}
                            className={cn(
                              "text-right font-semibold",
                              indicatorConfig[key].accent
                            )}
                          >
                            {formatCurrency(
                              monthlyPerformance[month]?.[key] ?? 0
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tabela de Variação</CardTitle>
              <p className="text-sm text-muted-foreground">
                Diferença em valor e percentual entre o primeiro e o último mês selecionados.
              </p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {variationSummary.length === 0 ? (
                <div className="rounded-md border border-dashed p-6 text-center text-muted-foreground">
                  Selecione pelo menos dois meses para visualizar a tabela de variação.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Indicador</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead className="text-right">
                        Diferença em Valor
                      </TableHead>
                      <TableHead className="text-right">
                        Diferença (%)
                      </TableHead>
                      <TableHead>Tendência</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variationSummary.map((row) => (
                      <TableRow key={row.key}>
                        <TableCell className="font-medium">{row.label}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {row.range}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-semibold",
                            row.diff > 0 && "text-green-600",
                            row.diff < 0 && "text-red-600"
                          )}
                        >
                          {row.diff > 0 ? "+" : ""}
                          {formatCurrency(row.diff)}
                        </TableCell>
                        <TableCell className="text-right">
                          {row.percent === null
                            ? "—"
                            : `${row.percent > 0 ? "+" : ""}${row.percent.toFixed(
                              1
                            )}%`}
                        </TableCell>
                        <TableCell>
                          <span className={cn("flex items-center gap-2 text-sm", row.trend.color)}>
                            {row.trend.icon} {row.trend.label}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card data-print-hide="true">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Destaques Automáticos</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Insights gerados a partir do resultado líquido.
                  </p>
                </div>
                <TrendingUp className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent className="space-y-4">
                {highlights ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border p-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase">
                          Melhor mês
                        </p>
                        <p className="text-lg font-semibold capitalize">
                          {highlights.bestMonth
                            ? highlights.bestMonth.label
                            : "—"}
                        </p>
                        <p className="text-sm text-green-600">
                          {formatCurrency(highlights.bestMonth?.liquido ?? 0)}
                        </p>
                      </div>

                      <div className="rounded-lg border p-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase">
                          Pior mês
                        </p>
                        <p className="text-lg font-semibold capitalize">
                          {highlights.worstMonth
                            ? highlights.worstMonth.label
                            : "—"}
                        </p>
                        <p className="text-sm text-red-600">
                          {formatCurrency(highlights.worstMonth?.liquido ?? 0)}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border p-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase">
                          Maior crescimento
                        </p>
                        {highlights.biggestGrowth ? (
                          <>
                            <p className="text-sm capitalize">
                              {formatMonthLabel(
                                highlights.biggestGrowth.from.month
                              )}{" "}
                              →{" "}
                              {formatMonthLabel(highlights.biggestGrowth.to.month)}
                            </p>
                            <p className="text-sm font-semibold text-green-600">
                              +{formatCurrency(highlights.biggestGrowth.diff)}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">—</p>
                        )}
                      </div>

                      <div className="rounded-lg border p-4">
                        <p className="text-xs font-medium text-muted-foreground uppercase">
                          Maior queda
                        </p>
                        {highlights.biggestDrop ? (
                          <>
                            <p className="text-sm capitalize">
                              {formatMonthLabel(
                                highlights.biggestDrop.from.month
                              )}{" "}
                              →{" "}
                              {formatMonthLabel(highlights.biggestDrop.to.month)}
                            </p>
                            <p className="text-sm font-semibold text-red-600">
                              {formatCurrency(highlights.biggestDrop.diff)}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">—</p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Tendência geral
                      </p>
                      <div className="mt-2 flex items-center gap-2 text-lg font-semibold">
                        <span className={highlights.overallTrend.color}>
                          {highlights.overallTrend.icon}
                        </span>
                        <span
                          className={cn(
                            highlights.overallTrend.icon === "🔼" &&
                            "text-green-600",
                            highlights.overallTrend.icon === "🔽" &&
                            "text-red-600",
                            highlights.overallTrend.icon === "➖" &&
                            "text-yellow-600"
                          )}
                        >
                          {highlights.overallTrend.icon === "🔼"
                            ? "Subindo"
                            : highlights.overallTrend.icon === "🔽"
                              ? "Caindo"
                              : "Estável"}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sem dados suficientes para gerar destaques.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-muted/40">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle>Texto Automático de Análise</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Descrição resumida pronta para apresentações e relatórios.
                  </p>
                </div>
                <Sparkles className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
                  {analysisText}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default PerformanceAnalysisPage;

