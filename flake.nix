{
  inputs = {
    # Update lockfile with `nix flake lock --update-input <input>`
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    systems.url = "github:nix-systems/default";
    devenv = {
      url = "github:cachix/devenv";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, devenv, systems, ... } @ inputs:

    let
      eachSystem = nixpkgs.lib.genAttrs (import systems);
      system = builtins.currentSystem;
      pkgs = nixpkgs.legacyPackages.${system};
    in
      {
        devShell.${system} = devenv.lib.mkShell {
          inherit inputs pkgs;
          modules = [
            {
              packages = [
                pkgs.nodejs_23
                pkgs.nodePackages.yarn
              ];

              pre-commit.hooks = {
                biome = {
                  package = pkgs.biome;
                  enable = true;
                  entry = "${pkgs.biome}/bin/biome check --write --no-errors-on-unmatched --diagnostic-level=error --verbose";
        };
        typos = {
          enable = true;
          entry = "${pkgs.typos}/bin/typos --force-exclude --exclude .git/*";
        };
              };
            }
          ];
        };
      };
}
