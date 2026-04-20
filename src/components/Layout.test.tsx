import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Layout } from "./Layout";

describe("Layout", () => {
  it("shows standings link in the header", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<div>Home content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "View standings" })).toHaveAttribute("href", "/standings");
  });
});
