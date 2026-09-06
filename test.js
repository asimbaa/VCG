const code = `        <Button 
          onClick={() => {
            setSentryActive(!sentryActive);
            toast.success(sentryActive ? "Neural Sentry Deactivated" : "Neural Sentry Activated");
          }}
          className={sentryActive ? "bg-emerald-600 hover:bg-emerald-500" : "bg-slate-800 hover:bg-slate-700"}
        >
          <Cpu className="w-4 h-4 mr-2" /> 
          {sentryActive ? "Sentry Active" : "Enable Sentry"}
        </Button>
        </div>
      </div>
    </div>
  );
}`;

console.log(code.match(/<\/div>\n    <\/div>\n  \);\n\}/));
